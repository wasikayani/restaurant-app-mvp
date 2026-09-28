# Q8 Note – When NOT to use useMemo and useCallback

`useMemo` and `useCallback` are not free. Each one stores a cached value and compares its dependency array on every render, and it makes the code harder to read.

Do not use them when:

- **The calculation is cheap**, such as adding two numbers or formatting a string. Recalculating is faster than caching.
- **The function is passed to a normal element** like `<TouchableOpacity>`, or to a child that is *not* wrapped in `React.memo`. A stable reference changes nothing there.
- **The dependencies change on almost every render**, so the cache is thrown away anyway.
- **There is no measured problem.** Optimise only after you see slow renders, for example with a render counter or console logs.

In this app they are used only where it matters: filtering and sorting the menu list, the order totals, and the handlers passed to the memoised `MenuItemCard`.

*(≈140 words)*

## Proof (before and after)

| Situation | Cards re-rendered after tapping ONE heart |
|---|---|
| Before: `ENABLE_MEMO = false` (no `React.memo`, new handler functions every render) | **19** (every card) |
| After: `React.memo` and `useCallback` | **1** (only the tapped card) |
