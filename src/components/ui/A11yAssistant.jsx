import { useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import styles from './styles/A11yAssistant.module.css'

export default function A11yAssistant() {
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [apiKey, setApiKey] = useState('')
    const [hasKey, setHasKey] = useState(false)

    useEffect(() => {
        const savedKey = sessionStorage.getItem('kit_api_key')
        if (savedKey) {
            setApiKey(savedKey)
            setHasKey(true)
        }
    }, [])

    const handleSaveKey = () => {
        if (apiKey.trim()) {
            sessionStorage.setItem('kit_api_key', apiKey)
            setHasKey(true)
        }
    }

    useEffect(() => {
        return () => {
            window.speechSynthesis
        }
    }, [])

    const handleAssistClick = async () => {
        if (isProcessing) return

        if (isSpeaking) {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
            return
        }

        setIsProcessing(true)

        try {
            // 1. Capture the screen silently
            const canvas = await html2canvas(document.body, {
                useCORS: true,
                scale: 1
            })
            const base64Image = canvas.toDataURL("image/jpeg", 0.7)

            // 2. Send to the local Vision-Capable Model
            const visionRes = await fetch(`/api/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "kit.mistral-small-4-119b-a8b",
                    messages: [
                        {
                            role: "system",
                            content: "You are an accessibility assistant for visually impaired users in a digital museum twin. Briefly describe the current layout, what data is currently visible, and what interactive buttons are available on screen. Keep it under 3 sentences. No formatting-- plaint text only. No shortening of words."
                        },
                        {
                            role: "user",
                            content: [
                                { type: "text", text: "Describe this user interface." },
                                { type: "image_url", image_url: { url: base64Image } }
                            ]
                        }
                    ],
                    max_tokens: 150
                })
            })

            if (!visionRes.ok) {
                const errorText = await visionRes.text()
                console.error("🚨 VISION API ERROR 🚨:", errorText)
                throw new Error(`Vision API failed: ${visionRes.status}`)
            }

            const visionData = await visionRes.json()
            console.log("🤖 Raw Mistral Data:", visionData)

            // Safely extract the AI's description
            const description = visionData.choices[0]?.message?.content ||
                "I'm sorry, I couldn't process the layout at this time."

            console.log("🗣️ AI Description:", description)

            // 3. Read it out loud using the Browser's Native Voice
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(description)
            utterance.lang = 'en-US' // Or 'de-DE' 
            utterance.rate = 1.0

            utterance.onend = () => setIsSpeaking(false)
            utterance.onerror = (e) => setIsSpeaking(false)

            window.speechSynthesis.speak(utterance)
            setIsSpeaking(true)

        } catch (error) {
            console.error("Accessibility Assistant Error:", error)

            // Fallback voice error so the user isn't left in silence
            window.speechSynthesis.cancel()
            window.speechSynthesis.speak(
                new SpeechSynthesisUtterance("Sorry, the visual assistant is currently offline.")
            )
        } finally {
            setIsProcessing(false)
        }
    }

   if (!hasKey) {
        return (
            <div className={styles.fabInputContainer}>
                <input 
                    type="password" 
                    placeholder="Enter API Key" 
                    aria-label="Enter API Key"
                    value={apiKey} 
                    onChange={(e) => setApiKey(e.target.value)}
                    className={styles.keyInput}
                />
                <button 
                    onClick={handleSaveKey} 
                    className={styles.keySaveBtn}
                    aria-label="Save API Key"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>
        )
    }

    return (
        <button
            className={`${styles.fab} ${isProcessing ? styles.processing : ''}`}
            onClick={handleAssistClick}
            aria-label="Describe screen out loud"
            aria-busy={isProcessing}
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                {isProcessing ? (
                    // Loading spinner
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                ) : isSpeaking ? (
                    <rect x="6" y="6" width="12" height="12" fill="currentColor" />
                ) : (
                    <>
                        <path d="M12 2v20M8 7v10M4 11v2M16 7v10M20 11v2" />
                        <circle cx="12" cy="12" r="3"></circle>
                    </>
                )}
            </svg>
            <span>{!isProcessing && !isSpeaking ? "Assist" : "Stop"}</span>
        </button>
    )
}