# 🚀 CC-LTMR – Character-Conditioned Long-Term Memory Reasoner

**CC-LTMR** is an AI-powered application that checks whether a given character backstory is *consistent* or *contradictory* with extremely long novels using:

* Long-term vector memory
* Character-specific episodic memory
* Hierarchical memory compression
* Gemini reasoning model

---

## ✨ Key Features

* 🔍 **Long-Context Understanding** – Handles books with 100k+ tokens
* 🧠 **Character-Specific Memory** – Each character gets their own memory profile
* 🗂 **Hierarchical Episodic Slots** – Compresses global memory efficiently
* 🤖 **Gemini-Powered Reasoning** – Produces clean `0/1` predictions with rationale
* ♻️ **Resumable Pipeline** – Safe for long-running batch inference
* 📄 **Submission-Ready Output** – Exports clean `final_predictions.csv`

---

## 📁 Project Structure

```
cc-ltmr/
 ├── app/                 # AI Studio frontend app
 ├── downloaded_dataset/  # Auto-downloaded books + test.csv
 ├── pipeline.py         # Pathway end-to-end pipeline
 ├── final_predictions.csv
 └── .env.local
```

---

## ⚙️ Local Setup

### **Prerequisites**

* Node.js 18+
* Python 3.10+

---

## ▶️ Run the App Locally

### 1️⃣ Install Dependencies

```bash
npm install
```

---

### 2️⃣ Configure Gemini API Key

Create a file called **.env.local** in the project root and add:

```
GEMINI_API_KEY=your_api_key_here
```

---

### 3️⃣ Start the Development Server

```bash
npm run dev
```

Open browser at:

```
http://localhost:3000
```

---

## 📊 Output Format

After running the pipeline, predictions are saved in:

**final_predictions.csv**

| Story ID | Prediction | Rationale                                                                 |
| -------- | ---------- | ------------------------------------------------------------------------- |
| 46       | 1          | The backstory aligns with the novel’s account of Thalcave’s displacement. |
| 137      | 0          | Faria was not re-arrested in 1815 as claimed.                             |

---

## 🧠 How It Works

* **Books are chunked & embedded** into a long-term memory store.
* **Character-conditioned retrieval** builds episodic memory for each character.
* **Hierarchical clustering** compresses memories into fixed-size slots.
* **Gemini reasoning model** judges consistency using retrieved evidence.

---

## 🏁 Ready for Hackathons

This system is optimized for:

* Low-data scenarios (≤ 80 rows)
* Extremely long documents
* High-stakes consistency reasoning

---

## 📜 License

MIT License
