import JSURL from "jsurl"
export default function (thisData, thisString, thisCycles = 320, thisTrys = 9000, thisLetters = "etaoinshrdcumwfgypbvkjxqz",
  thisNumbers = "0123456789."){
  this.data = thisData
  this.string = thisString
  this.cycles = thisCycles
  this.trys = thisTrys
  this.letters = thisLetters
  this.numbers = thisNumbers
  this.countUp = [0,0,0] 
  this.compressed = {}
  this.log = true // false
  this.goodStrings = []
  
  this.getTryKeys = (chrList) => {
    return chrList.replace("e","").split("").reverse()
  }
  this.getChrList = (letters, numbers) => {
    return letters + letters.toUpperCase() + numbers
  }
  let _tryKeys = this.getTryKeys(this.getChrList(this.letters, this.numbers))
  
  this.debounce = (func, wait = 2500, immediate) => {
    var timeout
    return function() {
      var context = this, args = arguments;
      clearTimeout(timeout)
      timeout = setTimeout(function() {
        timeout = null
        if (!immediate) func.apply(context, args)
      }, wait);
      if (immediate && !timeout) func.apply(context, args)
    }
  }

  this.updateData = (data) => {
    this.debounce(this.setData, 2200)(data)
  }
  this.setData = (data) => {
    console.log(data)
  }
  this.findAkey = (text) => {
    for (; this.countUp[2] < _tryKeys.length; this.countUp[2]++) {
      if (text.indexOf(_tryKeys[this.countUp[2]]) === -1) {
        return _tryKeys[this.countUp[2]]
      }
    }
    this.countUp[2] = 0
    for (; this.countUp[2] < _tryKeys.length; this.countUp[2]++) {
      if (text.indexOf("E" + _tryKeys[this.countUp[2]]) === -1) {
        return "E" + _tryKeys[this.countUp[2]]
      }
      if (text.indexOf("e" + _tryKeys[this.countUp[2]]) === -1) {
        return "e" + _tryKeys[this.countUp[2]]
      }
    }
    this.countUp[2] = 0
    for (; this.countUp[1] < _tryKeys.length; this.countUp[1]++) {
      for (; this.countUp[2] < _tryKeys.length; this.countUp[2]++) {
        if (text.indexOf(_tryKeys[this.countUp[1]] + _tryKeys[this.countUp[2]]) === -1) {
          return _tryKeys[this.countUp[1]] + _tryKeys[this.countUp[2]]
        }
      }
      this.countUp[2] = 0
    }
    this.countUp[1] = 0
    for (; this.countUp[1] < _tryKeys.length; this.countUp[1]++) {
      for (; this.countUp[2] < _tryKeys.length; this.countUp[2]++) {
        if (text.indexOf("e"+_tryKeys[this.countUp[1]] + _tryKeys[this.countUp[2]]) === -1) {
          return "e"+_tryKeys[this.countUp[1]] + _tryKeys[this.countUp[2]]
        }
        if (text.indexOf(_tryKeys[this.countUp[1]] + "e" + _tryKeys[this.countUp[2]]) === -1) {
          return _tryKeys[this.countUp[1]] + "e" + _tryKeys[this.countUp[2]]
        }
      }
      this.countUp[2] = 0
    }
    this.countUp[1] = 0

    for (; this.countUp[0] < _tryKeys.length; this.countUp[0]++) {
      for (; this.countUp[1] < _tryKeys.length; this.countUp[1]++) {
        for (; this.countUp[2] < _tryKeys.length; this.countUp[2]++) {
          if (text.indexOf(_tryKeys[this.countUp[0]] + _tryKeys[this.countUp[1]] + _tryKeys[this.countUp[2]]) === -1) {
            return _tryKeys[this.countUp[0]] + _tryKeys[this.countUp[1]] + _tryKeys[this.countUp[2]]
          }
        }
        this.countUp[2] = 0
      }
      this.countUp[1] = 0
    }
    this.countUp[0] = 0
    return false
  }
  this.decode = (theInput, noSet) => {
    if (theInput) {
      var theOutput
      var data

      // this._countDown = this.getIndexKey(_tryKeys) // reset count down
      try { // the new way
        data = JSURL.parse(theInput)
      } catch (e) { // try the old way
        try { // try the old way
          data = JSON.parse(decodeURIComponent(theInput))
        } catch (e) { // try with added )'s
          try { data = JSURL.parse(theInput+")")} catch (e) {
            try { data = JSURL.parse(theInput+"))") } catch (e) {
              try { data = JSURL.parse(theInput+")))") } catch (e) {
                try { data = JSURL.parse(theInput+"))))") } catch (e) {
                  data = JSURL.parse(theInput+")))))")
                }
              }
            }
          }
        }
      }
      if (Object.keys(data).length === 1 && Object.keys(data)[0].length > 20 && Array.isArray(data[Object.keys(data)[0]])) {
        var arrayOfKeys = data[Object.keys(data)[0]]
        var hydrating = Object.keys(data)[0]
        var compressedStr = JSON.stringify(data)
        if (compressedStr !== JSON.stringify(this.compressed)) {
          this.compressed  = JSON.parse(compressedStr)
        }
        for (index in arrayOfKeys) {
          var key = arrayOfKeys[index]
          var theKey = ""
          var theString = key.slice(3)
          if (key.length === 2 || key.length === 3) {
            theKey = key[0]
            theString = key.slice(1)
          } else if (key.slice(1, 2) === "e" && key.slice(2, 3) === "e") {
            theKey = key.slice(0, 1)
          } else if (key.slice(2, 3) === "e") {
            theKey = key.slice(0, 2)
          } else {
            theKey = key.slice(0, 3)
          }
          hydrating = hydrating.split(theKey).join(theString)
        }
        try {
          theOutput = JSON.parse(hydrating)
        } catch (e) {
          theOutput = hydrating
        }
        if (!noSet) {
          if (JSON.stringify(theOutput) !== JSON.stringify(this.data)) {
            this.done = false
            this.data = theOutput
          } else {
            this.done = true
          }
        }
        return theOutput
      } else {
        if (!noSet) {
          if (JSON.stringify(data) !== JSON.stringify(this.data)) {
            this.done = false
            this.data = data
          } else {
            this.done = true
          }
        }
        return data
      }
    }
  }
  this.encode = (theInput, size, cycles = this.cycles, simpleString) => {
    if (!this.done && !this.string || JSON.stringify(theInput) != JSON.stringify(this.decode(this.string))) {
      //this.$emit("compressing", true)
      if (!size || typeof size !== 'number') { // to (data, data.*)
        simpleString = JSURL.stringify(theInput)
        size = simpleString.length
        this.countUp = [0,0,0]
      }
      let input = JSON.stringify(theInput)
      let output = {e:JSON.stringify(theInput),k:[]}
      if (typeof theInput === "string") {
        input = "" + theInput
        output = {e: theInput, k:[]}
      } else if (theInput.e) {
        input = "" + theInput.e
        output = JSON.parse(JSON.stringify(theInput))
      }
      let reg = /(?=((.+)(?:.*?\2)+))/g
      if (size < 50) {
        if (JSURL.stringify(theInput) !== this.string) {
          this.string = JSURL.stringify(theInput)
        }
        return JSURL.stringify(theInput) // No need to reduce
      } else if (size > 5000){
        reg = /(?=((..+)(?:..*?\2)+))/g
      }
      var sub = "" //somewhere to stick temp results
      var maxstr = "" // our maximum length repeated string
      var maxSaving = 2
      var key = this.findAkey(input)

      if (key) {
        var theKey = ""
        if (key.length === 3) {
          theKey = key
        } else if (key.length === 2) {
          theKey = key + "e"
        } else if (key.length === 1) {
          theKey = key + "ee"
        }
        var smallSavingTestLimit = +this.trys

        reg.lastIndex = 0
        var sizeOfSlice = Math.floor(input.length / this.cycles) + 150
		
        let testSlice = input
        if (input.length > sizeOfSlice) {
          let startSlice = Math.random()*(input.length - sizeOfSlice)
	  testSlice = input.slice(startSlice, startSlice + sizeOfSlice)
        }
        var inputSize = JSURL.stringify(input).length
        sub = reg.exec(testSlice) // find the first repeated string
        while (!(sub == null)) {
          var saving = inputSize - JSURL.stringify( "\"" + theKey + sub[2] + "\"," + input.split(sub[2]).join(key)).length
          if (saving > maxSaving) {
            maxSaving = +saving
            maxstr = sub[2]
            if (maxSaving > ((inputSize / 10) + 50)) { // good saving take it
              break
            }
            smallSavingTestLimit = +this.trys
          } else {
            if (smallSavingTestLimit-- < 1) {
              if (this.log) {console.log("trys out")}
              break
            }
          }
          sub = reg.exec(testSlice)
          reg.lastIndex++; // start searching from the next position
        }
        if (maxstr) {
          output.e = input.split(maxstr).join(key)

          if (key.length === 3) {
            theKey = key + maxstr
          } else if (key.length === 2) {
            theKey = key + "e" + maxstr
          } else if (key.length === 1 && (maxstr.length === 1 || maxstr.length === 2)) {
            theKey = key + maxstr
          } else if (key.length === 1) {
            theKey = key + "ee" + maxstr
          }
          output.k.unshift(theKey)
          this.goodStrings.push(theKey)
          if (this.log) {console.log("Saving", maxSaving)}
        } else {
          if (this.log) {console.log("out savings")}
        }
      } else {
        if (this.log) {console.log("out of keys")}
      }
      if (JSURL.stringify(output).length + 2 < JSURL.stringify(theInput).length || cycles > 0) {
        //this.$emit("cycles-left", cycles)
        return this.encode(output, size, cycles-1, simpleString)
      } else {
        this.done = true
        let outputObj = {}
        outputObj[output.e] = output.k
        var outputLength = JSURL.stringify(outputObj).length
        this.totalSaving = size - outputLength
	if (this.log) {
	  console.log("totalSaving", this.totalSaving, size, outputLength, outputLength/size)
	  console.log("outputObj values", Object.values(outputObj), Object.values(outputObj).length)
          console.log(this.goodStrings)
	}
        //this.$emit("compressing", false)
        if (this.totalSaving > 0) {
          if (JSURL.stringify(outputObj) !== this.string) {
            this.compressed = outputObj
            this.string = JSURL.stringify(outputObj)
          }
          return JSURL.stringify(outputObj)
        } else {
          return simpleString
        }
      }
    }
  }
}
