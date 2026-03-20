import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["mic", "status", "csrfToken"]
  static values = { url: String }

  connect() {
    this.isListening = false
    this.resultListener = null
  }

  disconnect() {
    this.#stopDictation()
  }

  toggleDictation() {
    if (this.isListening) {
      this.#stopDictation()
    } else {
      this.#startDictation()
    }
  }

  get isNative() {
    return window.Capacitor && window.Capacitor.isNativePlatform()
  }

  get speechPlugin() {
    return window.Capacitor?.Plugins?.SpeechRecognition
  }

  async #startDictation() {
    if (this.isNative && this.speechPlugin) {
      await this.#startNativeDictation()
    } else {
      this.#startWebDictation()
    }
  }

  async #startNativeDictation() {
    try {
      this.#setStatus("Listening...")
      this.resultListener = await this.speechPlugin.addListener("result", (data) => {
        if (data.isFinal) {
          this.#stopDictation()
          this.#parseTranscript(data.transcript)
        }
      })

      await this.speechPlugin.start()
      this.isListening = true
      this.micTarget.classList.add("listening")
    } catch {
      this.#setStatus("")
      this.#stopDictation()
    }
  }

  async #startWebDictation() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      this.#setStatus("Speech recognition not supported in this browser")
      return
    }

    // Check microphone permission first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
    } catch {
      this.#setStatus("Microphone access denied. Please allow microphone in your browser settings.")
      return
    }

    this.gotResult = false
    this.stopped = false
    this.recognition = new SpeechRecognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = "en-US"

    this.recognition.onstart = () => {
      this.isListening = true
      this.micTarget.classList.add("listening")
      this.#setStatus("Listening... speak now")
    }

    this.recognition.onresult = (event) => {
      this.gotResult = true
      let transcript = ""
      let isFinal = false
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
        if (event.results[i].isFinal) isFinal = true
      }
      if (isFinal) {
        this.stopped = true
        this.recognition.stop()
        this.#setStatus("Parsing...")
        this.#parseTranscript(transcript)
      } else {
        this.#setStatus(`"${transcript}"`)
      }
    }

    this.recognition.onend = () => {
      // Auto-restart if we haven't got a result yet and user hasn't manually stopped
      if (!this.gotResult && !this.stopped && this.isListening) {
        try {
          this.recognition.start()
          return
        } catch {
          // fall through to cleanup
        }
      }
      this.isListening = false
      this.micTarget.classList.remove("listening")
      if (!this.gotResult && !this.stopped) {
        this.#setStatus("No speech detected. Tap the mic and try again.")
      }
      this.recognition = null
    }

    this.recognition.onerror = (event) => {
      // no-speech is not fatal — let onend auto-restart
      if (event.error === "no-speech") return

      this.stopped = true
      this.isListening = false
      this.micTarget.classList.remove("listening")
      const messages = {
        "not-allowed": "Microphone access denied. Please allow microphone in browser settings.",
        "audio-capture": "No microphone found. Please check your device.",
        "network": "Network error. Speech recognition requires an internet connection."
      }
      this.#setStatus(messages[event.error] || `Speech error: ${event.error}`)
      this.recognition = null
    }

    this.recognition.start()
  }

  async #stopDictation() {
    this.stopped = true
    if (this.isNative && this.speechPlugin) {
      try { await this.speechPlugin.stop() } catch { /* ignore */ }
      if (this.resultListener) {
        await this.resultListener.remove()
        this.resultListener = null
      }
    } else if (this.recognition) {
      this.recognition.stop()
      this.recognition = null
    }
    this.isListening = false
    if (this.hasMicTarget) {
      this.micTarget.classList.remove("listening")
    }
  }

  async #parseTranscript(transcript) {
    this.#setStatus("Parsing your activity...")
    this.micTarget.disabled = true

    try {
      const res = await fetch(this.urlValue, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": this.csrfTokenTarget.value
        },
        body: JSON.stringify({ transcript })
      })

      if (!res.ok) {
        this.#setStatus("Could not parse activity")
        return
      }

      const data = await res.json()
      this.#fillForm(data)
      this.#setStatus("Form filled! Review and save.")
    } catch {
      this.#setStatus("Parsing failed")
    } finally {
      this.micTarget.disabled = false
    }
  }

  #fillForm(data) {
    const form = this.element

    // Set category and trigger change event to update dynamic fields
    if (data.category) {
      const categorySelect = form.querySelector("select[name='activity[category]']")
      if (categorySelect) {
        categorySelect.value = data.category
        categorySelect.dispatchEvent(new Event("change", { bubbles: true }))
      }
    }

    // Wait a tick for category-fields controller to update the form
    setTimeout(() => {
      if (data.value) {
        const valueField = form.querySelector("input[name='activity[value]']")
        if (valueField) {
          valueField.value = data.value
          valueField.dispatchEvent(new Event("input", { bubbles: true }))
        }
      }

      if (data.unit) {
        // Try the select first
        const unitSelect = form.querySelector("select[name='activity[unit]']")
        const unitText = form.querySelector("input[data-category-fields-target='unitText']")

        if (unitSelect && unitSelect.style.display !== "none") {
          // Check if the value exists as an option
          const optionExists = Array.from(unitSelect.options).some(o => o.value === data.unit)
          if (optionExists) {
            unitSelect.value = data.unit
          } else if (unitText) {
            unitText.value = data.unit
          }
        } else if (unitText && !unitText.readOnly) {
          unitText.value = data.unit
        }
      }

      if (data.calories) {
        const caloriesField = form.querySelector("input[name='activity[calories]']")
        if (caloriesField) caloriesField.value = data.calories
      }

      if (data.notes) {
        const notesField = form.querySelector("textarea[name='activity[notes]']")
        if (notesField) notesField.value = data.notes
      }

      // Macros (hidden fields)
      const macroFields = {
        protein_g: "activity[protein_g]",
        carbs_g: "activity[carbs_g]",
        fat_g: "activity[fat_g]",
        fiber_g: "activity[fiber_g]",
        sugar_g: "activity[sugar_g]"
      }
      for (const [key, name] of Object.entries(macroFields)) {
        if (data[key]) {
          const field = form.querySelector(`input[name='${name}']`)
          if (field) field.value = data[key]
        }
      }
    }, 100)
  }

  #setStatus(msg) {
    if (this.hasStatusTarget) {
      this.statusTarget.textContent = msg
      this.statusTarget.style.display = msg ? "" : "none"
    }
  }
}
