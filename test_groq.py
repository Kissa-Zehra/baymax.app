"""
test_groq.py — Quick sanity check for your Groq API key

Run: python test_groq.py
"""
from langchain_groq import ChatGroq
from config import GROQ_API_KEY, GROQ_MODEL, validate_keys

def main():
    # Check keys are set
    missing = validate_keys()
    if "GROQ_API_KEY" in missing:
        print("❌ GROQ_API_KEY is missing. Add it to your .env file.")
        return

    print(f"Testing Groq with model: {GROQ_MODEL}")
    print("Sending test message...")

    llm = ChatGroq(api_key=GROQ_API_KEY, model=GROQ_MODEL)
    response = llm.invoke("Say exactly: 'Groq is working and blazing fast!' — nothing else.")

    print("\n✅ Response from Groq:")
    print(response.content)
    print("\nEnvironment setup is complete. Run: streamlit run app.py")

if __name__ == "__main__":
    main()
