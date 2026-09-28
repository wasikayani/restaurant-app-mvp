# Q4 Note – What if the filtering effect's dependency array is empty?

The filtering effect in `MenuScreen.js` is written as
`useEffect(() => { ...setFilteredItems(...) }, [selectedCategory, menuItems])`.

If its dependency array were left empty (`[]`), React would run the effect only once, right after the first render. At that moment `menuItems` is still an empty array, because the 1.5-second "fetch" has not finished yet. So `filteredItems` would be set to `[]` and never updated again.

The result: the screen would stay empty after loading, and tapping a category chip would change `selectedCategory` but not the list. The effect would keep using the **stale values** captured during the first render.

Listing `selectedCategory` and `menuItems` tells React to re-run the filter whenever either value changes, so the list always matches the current data and selection.

*(≈110 words)*
