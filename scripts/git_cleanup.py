#!/usr/bin/env python3
"""
Limpieza automática de ramas locales post-merge de PR.

Qué hace:
1. Sincroniza el remoto (git fetch --prune).
2. Actualiza la rama principal si está detrás del remoto (fast-forward).
3. Elimina ramas locales cuyo tracking remoto ya no existe (PRs mergeados).
4. Revierte .gitignore si fue modificado accidentalmente por worktrees.

Seguridad:
- Nunca borra la rama actual ni la rama principal configurada.
- Nunca usa `-D`: respeta ramas con cambios sin mergear.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

# ==============================================================================
# CONFIGURACIÓN GLOBAL
# ==============================================================================
DEFAULT_BRANCH = "main"
GITIGNORE_WORKTREE_MARK = "# Git worktrees"

# ==============================================================================
# GIT WRAPPERS (Capa de abstracción)
# ==============================================================================
def git_output(args: list[str]) -> str:
    """Ejecuta git y devuelve stdout. Lanza excepción si el comando falla."""
    try:
        result = subprocess.run(
            ["git", *args], capture_output=True, text=True, check=True
        )
        return result.stdout.rstrip("\n")
    except subprocess.CalledProcessError as e:
        print(f"  [error] git {' '.join(args)}: {e.stderr.strip()}", file=sys.stderr)
        raise

def git_check(args: list[str]) -> bool:
    """Ejecuta git y devuelve True si el código de salida es 0 (éxito)."""
    return subprocess.run(["git", *args], capture_output=True).returncode == 0

# ==============================================================================
# LÓGICA DE NEGOCIO
# ==============================================================================
def get_current_branch() -> str:
    return git_output(["rev-parse", "--abbrev-ref", "HEAD"])

def get_gone_branches(protected_branch: str) -> list[str]:
    """Retorna ramas locales cuyo upstream remoto ya no existe."""
    output = git_output([
        "for-each-ref",
        "--format=%(refname:short)|%(upstream:short)",
        "refs/heads/"
    ])

    gone = []
    for line in output.splitlines():
        if not line or "|" not in line:
            continue

        name, upstream = line.split("|", 1)

        # Retornos tempranos para evitar anidamiento
        if name == protected_branch or not upstream:
            continue

        upstream = upstream.removeprefix("remotes/")
        upstream_ref = f"refs/remotes/{upstream}"

        if not git_check(["rev-parse", "--verify", "--quiet", upstream_ref]):
            gone.append(name)

    return gone

def is_branch_behind(branch: str) -> bool:
    """Verifica si la rama local está estrictamente detrás de su remoto."""
    remote_ref = f"origin/{branch}"
    if not git_check(["rev-parse", "--verify", "--quiet", f"refs/remotes/{remote_ref}"]):
        return False

    output = git_output(["rev-list", "--left-right", "--count", f"{branch}...{remote_ref}"])
    behind, ahead = (int(x) for x in output.split())
    return behind == 0 and ahead > 0

def get_worktrees_for_branch(branch: str) -> list[str]:
    """Retorna las rutas de los worktrees asociados a una rama específica."""
    output = git_output(["worktree", "list", "--porcelain"])
    paths = []
    current_path = ""
    current_branch = ""

    for line in output.splitlines():
        if line.startswith("worktree "):
            if current_path and current_branch == f"refs/heads/{branch}":
                paths.append(current_path)
            current_path = line[9:]  # len("worktree ")
            current_branch = ""
        elif line.startswith("branch "):
            current_branch = line[7:]  # len("branch ")

    if current_path and current_branch == f"refs/heads/{branch}":
        paths.append(current_path)

    return paths

def is_gitignore_dirty_by_worktree() -> bool:
    """Verifica si .gitignore solo fue modificado por el bloque de worktrees."""
    gitignore = Path(".gitignore")
    if not gitignore.exists() or GITIGNORE_WORKTREE_MARK not in gitignore.read_text(encoding="utf-8"):
        return False

    if git_check(["diff", "--quiet", "--", ".gitignore"]):
        return False  # No hay cambios en .gitignore

    diff = git_output(["diff", "--", ".gitignore"])
    added_lines = {line[1:].strip() for line in diff.splitlines() if line.startswith("+")}

    # Uso de operaciones de conjuntos (Sets) para validación O(1)
    allowed_additions = {GITIGNORE_WORKTREE_MARK, ".worktrees/", ""}
    return added_lines.issubset(allowed_additions)

# ==============================================================================
# ACCIONES Y UI
# ==============================================================================
def confirm_action(prompt: str, auto_yes: bool) -> bool:
    if auto_yes:
        return True
    try:
        response = input(f"{prompt} [y/N] ").strip().lower()
        return response in ("y", "yes")
    except EOFError:
        return False

def remove_worktree_safely(path: str, is_dry_run: bool) -> bool:
    if is_dry_run:
        print(f"  [dry] worktree remove {path}")
        return True

    try:
        subprocess.run(["git", "worktree", "remove", path], check=True, capture_output=True, text=True)
        print(f"  [ok] worktree removido: {path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"  [skip] worktree con cambios sin commitear: {e.stderr.strip()}", file=sys.stderr)
        return False

def delete_branch_safely(name: str, is_dry_run: bool) -> bool:
    if is_dry_run:
        print(f"  [dry] branch -d {name}")
        return True

    try:
        subprocess.run(["git", "branch", "-d", name], check=True, capture_output=True, text=True)
        print(f"  [ok] rama eliminada: {name}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"  [skip] rama sin mergear completa, la dejo: {e.stderr.strip()}", file=sys.stderr)
        return False

# ==============================================================================
# PUNTO DE ENTRADA
# ==============================================================================
def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Limpieza automática de ramas locales post-merge de PR.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"Ejemplos:\n"
               f"  python3 git_cleanup.py\n"
               f"  python3 git_cleanup.py --branch dev --dry-run\n"
               f"  python3 git_cleanup.py --yes"
    )
    parser.add_argument("--dry-run", action="store_true", help="Muestra qué haría sin ejecutar cambios reales")
    parser.add_argument("--yes", "-y", action="store_true", help="Omite las confirmaciones interactivas")
    parser.add_argument(
        "--branch", "-b",
        default=DEFAULT_BRANCH,
        help=f"Rama principal a proteger y actualizar (default: '{DEFAULT_BRANCH}')"
    )
    return parser.parse_args()

def main() -> None:
    args = parse_arguments()
    main_branch = args.branch
    is_dry_run = args.dry_run
    auto_yes = args.yes

    status = " (DRY-RUN)" if is_dry_run else ""
    print(f"== Limpieza post-PR [Rama: {main_branch}]{status} ==\n")

    # 1. Fetch & Prune
    print("1. Sincronizando remoto (fetch --prune)...")
    if not is_dry_run:
        git_output(["fetch", "--prune", "origin"])
    else:
        print("  [dry] git fetch --prune origin")

    current_branch = get_current_branch()

    # 2. Actualizar rama principal
    print(f"\n2. Verificando rama principal ({main_branch})...")
    local_ref = f"refs/heads/{main_branch}"
    if git_check(["rev-parse", "--verify", "--quiet", local_ref]) and is_branch_behind(main_branch):
        print(f"  -> {main_branch} está detrás del remoto. Actualizando (fast-forward)...")
        if is_dry_run:
            print(f"  [dry] merge --ff-only origin/{main_branch}")
        elif current_branch == main_branch:
            git_output(["merge", "--ff-only", f"origin/{main_branch}"])
            print(f"  [ok] {main_branch} actualizada")
        else:
            print(f"  [skip] Estás en '{current_branch}'. No cambio de rama automáticamente.")
    else:
        print(f"  -> {main_branch} está al día o no existe localmente.")

    # 3. Limpieza de ramas "gone"
    print(f"\n3. Buscando ramas locales huérfanas (tracking remoto borrado)...")
    gone_branches = get_gone_branches(main_branch)
    print(f"  -> Encontradas: {len(gone_branches)}")

    for branch in sorted(gone_branches):
        if branch in (current_branch, main_branch):
            print(f"  [skip] Protegida (actual o principal): {branch}")
            continue

        if not confirm_action(f"  ¿Eliminar rama y worktrees de '{branch}'?", auto_yes):
            print(f"  [skip] Cancelado por usuario: {branch}")
            continue

        # Limpiar worktrees asociados primero
        worktrees = get_worktrees_for_branch(branch)
        wt_ok = all(remove_worktree_safely(wt, is_dry_run) for wt in worktrees)

        if wt_ok:
            delete_branch_safely(branch, is_dry_run)

    # 4. Restaurar .gitignore
    print(f"\n4. Verificando .gitignore...")
    if is_gitignore_dirty_by_worktree():
        print("  -> Modificado solo por worktrees. Revertiendo...")
        if is_dry_run:
            print("  [dry] git checkout -- .gitignore")
        elif confirm_action("  ¿Revertir .gitignore?", auto_yes):
            git_output(["checkout", "--", ".gitignore"])
            print("  [ok] .gitignore restaurado")
    else:
        print("  -> .gitignore limpio o con cambios manuales (no se toca).")

    print("\n== Proceso completado ==")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrumpido por el usuario.", file=sys.stderr)
        sys.exit(130)
    except subprocess.CalledProcessError:
        # Si un comando crítico de git falla, salimos con error
        sys.exit(1)
