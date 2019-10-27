# pure-annotation

Auto add pure annotation `#__PURE__` before call expression which side-effect is false

```
const COLOR_MAIN = /*#__PURE__*/ valueOnPlatform({
    android: '#D8D8D8', 
    iOS: '#BBBBBB'
})
```

`COLOR_MAIN` will be removed if it is not referenced