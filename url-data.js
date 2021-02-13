import JSURL from "jsurl"
export default {
  props: {
    data: Object,
    string: String,
    cycles: {
      type:Number,
      default: 32
    },
    trys: {
      type: Number,
      default: 100,
    },
  },
  watch:{
    string(val) {
      this.$emit("data",val)
    },
    data(val) {
      this.$emit("data",val)
    },
  },
  data() {
    return {
      letters: "etaoinshrdcumwfgypbvkjxqz",
      numbers: "0123456789.",
      countUp: [0,0,0],
      compressed: {},
    }
  },
  computed:{
    _chrList: {
      this.getChrList(this.letters,this.numbers)
    },
    _tryKeys() {
      this.getTryKeys(this._chrList)
    },
  },
  methods:{
    debounce:(func, wait = 2500, immediate) {
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
    },
    updateData: function(data){
      this.debounce(this.setData, 2200)
    },
    setData: function(){
      this.data = JSON.parse(JSON.stringify(this.debounceData))
    },
    findAkey: function(text) {
      for (; this.countUp[2] < this._tryKeys.length; this.countUp[2]++) {
        if (text.indexOf(this._tryKeys[this.countUp[2]]) === -1) {
          return this._tryKeys[this.countUp[2]]
        }
      }
      this.countUp[2] = 0
      for (; this.countUp[2] < this._tryKeys.length; this.countUp[2]++) {
        if (text.indexOf("E" + this._tryKeys[this.countUp[2]]) === -1) {
          return "E" + this._tryKeys[this.countUp[2]]
        }
        if (text.indexOf("e" + this._tryKeys[this.countUp[2]]) === -1) {
          return "e" + this._tryKeys[this.countUp[2]]
        }
      }
      this.countUp[2] = 0
      for (; this.countUp[1] < this._tryKeys.length; this.countUp[1]++) {
        for (; this.countUp[2] < this._tryKeys.length; this.countUp[2]++) {
          if (text.indexOf(this._tryKeys[this.countUp[1]] + this._tryKeys[this.countUp[2]]) === -1) {
            return this._tryKeys[this.countUp[1]] + this._tryKeys[this.countUp[2]]
          }
        }
        this.countUp[2] = 0
      }
      this.countUp[1] = 0
      for (; this.countUp[1] < this._tryKeys.length; this.countUp[1]++) {
        for (; this.countUp[2] < this._tryKeys.length; this.countUp[2]++) {
          if (text.indexOf("e"+this._tryKeys[this.countUp[1]] + this._tryKeys[this.countUp[2]]) === -1) {
            return "e"+this._tryKeys[this.countUp[1]] + this._tryKeys[this.countUp[2]]
          }
          if (text.indexOf(this._tryKeys[this.countUp[1]] + "e" + this._tryKeys[this.countUp[2]]) === -1) {
            return this._tryKeys[this.countUp[1]] + "e" + this._tryKeys[this.countUp[2]]
          }
        }
        this.countUp[2] = 0
      }
      this.countUp[1] = 0

      for (; this.countUp[0] < this._tryKeys.length; this.countUp[0]++) {
        for (; this.countUp[1] < this._tryKeys.length; this.countUp[1]++) {
          for (; this.countUp[2] < this._tryKeys.length; this.countUp[2]++) {
            if (text.indexOf(this._tryKeys[this.countUp[0]] + this._tryKeys[this.countUp[1]] + this._tryKeys[this.countUp[2]]) === -1) {
              return this._tryKeys[this.countUp[0]] + this._tryKeys[this.countUp[1]] + this._tryKeys[this.countUp[2]]
            }
          }
          this.countUp[2] = 0
        }
        this.countUp[1] = 0
      }
      this.countUp[0] = 0
      return false
    },
    getTryKeys: function(chrList) {
      return chrList.replace("e","").split("").reverse()
    },
    getChrList: function(letters, numbers) {
      return letters + letters.toUpperCase() + numbers
    },
    decode: function(theInput, noSet) {
      if (theInput) {
        var theOutput
        var data

        // this._countDown = this.getIndexKey(this._tryKeys) // reset count down
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
    },
    encode: function(theInput, size, cycles, simpleString) {
      if (!this.done && !this.string || JSON.stringify(theInput) != JSON.stringify(this.decode(this.string))) {
        this.$emit("compressing", true)
        if (cycles === undefined) {
          cycles = this.cycles
        }
        if (!size || typeof size !== 'number') { // to (data, data.*)
          simpleString = JSURL.stringify(theInput)
          size = simpleString.length
          this.countUp = [0,0,0]
        }
        if (typeof theInput === "string") {
          var input = "" + theInput
          var output = {e: theInput, k:[]}
        } else {
          if (theInput.e) {
            var input = "" + theInput.e
            var output = JSON.parse(JSON.stringify(theInput))
          } else {
            var input = JSON.stringify(theInput)
            var output = {e:JSON.stringify(theInput),k:[]}
          }
        }
        if (size < 50) {
          if (JSURL.stringify(theInput) !== this.string) {
            this.string = JSURL.stringify(theInput)
          }
          return JSURL.stringify(theInput) // No need to reduce
        } else if (size > 5000){
          var reg = /(?=((..+)(?:..*?\2)+))/g
        } else {
          var reg = /(?=((.+)(?:.*?\2)+))/g
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
          var sizeOfSlice = Math.floor(input.length / this.cycles / 2) + 50
          if (input.length > sizeOfSlice) {
            var startSlice = Math.floor((input.length - sizeOfSlice) * (cycles / this.cycles))
            var testSlice = input.slice(startSlice, startSlice + sizeOfSlice)
          } else {
            var testSlice = input
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
            if (this.log) {console.log("Saving", maxSaving)}
          } else {
            if (this.log) {console.log("out savings")}
          }
        } else {
          if (this.log) {console.log("out of keys")}
        }
        if (JSURL.stringify(output).length + 2 < JSURL.stringify(theInput).length || cycles > 0) {
          this.$emit("cycles-left", cycles)
          return this.encode(output, size, cycles-1, simpleString)
        } else {
          this.done = true
          outputObj = {}
          outputObj[output.e] = output.k
          var outputLength = JSURL.stringify(outputObj).length
          outputObj = {}
          outputObj[output.e] = output.k
          this.totalSaving = size - outputLength
          this.$emit("compressing", false)
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
}