<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Existing application boundaries
- Navigation must target implemented route files only; deferred modules must not introduce dead links, because TanStack route references are type checked.
- Reuse the existing onboarding company form for registration from the app shell, because adding a company must not depend on an unimplemented settings page.
- Every parallel database query must propagate its errors and guard optional profile/company references, because failed reads must not masquerade as empty results.
