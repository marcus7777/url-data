# smaller js
A way to send data through URL automatically eliminating repeating data.
```js
import smallerjs from "smallerjs"

const {encode, decode} = smallerjs()
const asUrl = encode(user)

console.log(decode(asUrl) )
```
