# Q6 Note – Why Context instead of prop drilling

The logged-in user and the light/dark theme are needed by almost every screen: Login, Menu, Profile, Dashboard, the header avatar and the account menu.
With prop drilling, `App` would have to pass `user` and `colors` down through the navigator, every tab, every stack and every component, even components that do not use them and only forward them.
Context puts this data in one Provider at the top of the app. Any component can read it directly with `useAuth()` or `useTheme()`, however deep it is in the tree.
This keeps components independent and easier to move or reuse. Logging out or toggling dark mode in one place instantly updates every screen that uses the data.

**Drawback:** when a context value changes, every component that consumes that context re-renders, even if it only uses part of the value. For example, toggling the theme re-renders every screen that calls `useTheme()`. For data that changes very often, this can hurt performance, so context is best for "global and rarely changing" data like auth and theme.
