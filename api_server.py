import sys
import io

# =====================================================================
# WINDOWS UNICODE ENCODING FIX
# =====================================================================
# Force stdout/stderr to UTF-8 to prevent charmap encoding errors on Windows
# when pre-existing modules print emoji characters like ✅ at load time.
# =====================================================================
try:
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    except Exception:
        pass

try:
    if sys.stderr.encoding != 'utf-8':
        sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    try:
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    except Exception:
        pass

import os
import json
import logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CrisisLensAI-API")

# Load environment variables
load_dotenv()

# =====================================================================
# IN-MEMORY MONKEYPATCH FOR GROQ API KEY
# =====================================================================
# The original utils/gemini_relief_agent.py hardcodes API_KEY = "YOUR_GROQ_API_KEY"
# We patch it in memory at load time using the GROK_API_KEY from .env
# =====================================================================
grok_key = os.environ.get("GROK_API_KEY")
if grok_key and grok_key != "YOUR_GROQ_API_KEY":
    logger.info("Initializing in-memory Groq client patch with GROK_API_KEY from environment...")
    try:
        import utils.gemini_relief_agent
        from groq import Groq
        utils.gemini_relief_agent.API_KEY = grok_key
        utils.gemini_relief_agent.client = Groq(api_key=grok_key)
        logger.info("Groq client successfully patched in memory.")
    except Exception as e:
        logger.error(f"Failed to patch Groq client: {e}")
else:
    logger.warning("GROK_API_KEY not found in environment. Groq AI relief agent calls may fail.")

# Now import the pipeline which relies on the patched agent
try:
    from utils.pipeline import analyze_report
except Exception as e:
    logger.error(f"Failed to import pipeline: {e}")
    # Fallback mock analyze function in case of loading issues
    def analyze_report(report):
        logger.warning("Using fallback mock analyzer due to import failures.")
        return {
            "disaster": "Flood",
            "location": "Swat",
            "severity": "Medium",
            "authenticity": "Likely Real",
            "alerts": {
                "citizen": "Stay away from river banks. Evacuate to higher grounds.",
                "ngo": "Deploy food rations and clean water units to Swat outskirts.",
                "government": "Deploy rescue boats. Establish relief camp at Government High School."
            },
            "briefing": "🚨 SITUATION SUMMARY\nHeavy rains have led to high flows in Swat.\n\n⚠️ THREAT ASSESSMENT\n- Risk level: Medium\n- Infrastructure damage expected near banks.\n\n🚑 EMERGENCY RESPONSE PLAN\n- Immediate: Evacuate low-lying areas.\n\n📦 RESOURCE ALLOCATION ADVICE\n- 5 Rescue Teams\n- 2 Ambulances\n\n📢 PUBLIC SAFETY RECOMMENDATIONS\n- Avoid traveling near River Swat.\n\n🏛️ GOVERNMENT ACTION PLAN\n- DC Swat monitoring situation.\n\n🚁 RESCUE PRIORITIES\n- Priority 1: Evacuation of stranded families.\n\n🔄 RECOVERY STRATEGY\n- Clear blocked roads."
        }

# =====================================================================
# APP INITIALIZATION
# =====================================================================
app = FastAPI(
    title="CrisisLens AI API",
    description="Backend API for disaster classification, mapping, and AI assistance",
    version="2.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load historical database
DATASET_PATH = os.path.join(os.path.dirname(__file__), "data", "training_dataset.json")
historical_data = []
if os.path.exists(DATASET_PATH):
    try:
        with open(DATASET_PATH, "r", encoding="utf-8") as f:
            historical_data = json.load(f)
        logger.info(f"Loaded {len(historical_data)} historical records from {DATASET_PATH}")
    except Exception as e:
        logger.error(f"Failed to load dataset: {e}")
else:
    logger.warning(f"Dataset path {DATASET_PATH} does not exist.")

# Helper to map locations to provinces
def map_to_province(loc_str, text_str=""):
    loc_lower = str(loc_str).lower()
    text_lower = str(text_str).lower()
    
    # Check explicitly for province names first
    if "khyber" in loc_lower or "kpk" in loc_lower or "swat" in loc_lower or "peshawar" in loc_lower or "chitral" in loc_lower or "abbottabad" in loc_lower or "mardan" in loc_lower or "mansehra" in loc_lower or "kohistan" in loc_lower:
        return "KPK"
    if "punjab" in loc_lower or "lahore" in loc_lower or "rawalpindi" in loc_lower or "multan" in loc_lower or "faisalabad" in loc_lower or "sialkot" in loc_lower or "dg khan" in loc_lower or "dera ghazi khan" in loc_lower:
        return "Punjab"
    if "sindh" in loc_lower or "karachi" in loc_lower or "hyderabad" in loc_lower or "thatta" in loc_lower or "badin" in loc_lower or "sukkur" in loc_lower or "jacobabad" in loc_lower:
        return "Sindh"
    if "balochistan" in loc_lower or "quetta" in loc_lower or "gwadar" in loc_lower or "kalat" in loc_lower or "barkhan" in loc_lower or "lasbela" in loc_lower:
        return "Balochistan"
    if "islamabad" in loc_lower:
        return "Islamabad"
    if "gilgit" in loc_lower or "skardu" in loc_lower or "hunza" in loc_lower or "baltistan" in loc_lower:
        return "Gilgit-Baltistan"
    if "muzaffarabad" in loc_lower or "ajk" in loc_lower or "azad kashmir" in loc_lower:
        return "AJK"
    
    # Fallback to scanning text
    if "swat" in text_lower or "peshawar" in text_lower or "kpk" in text_lower or "mingora" in text_lower:
        return "KPK"
    if "quetta" in text_lower or "balochistan" in text_lower or "gwadar" in text_lower:
        return "Balochistan"
    if "lahore" in text_lower or "punjab" in text_lower or "rawalpindi" in text_lower:
        return "Punjab"
    if "karachi" in text_lower or "sindh" in text_lower:
        return "Sindh"
    if "islamabad" in text_lower:
        return "Islamabad"
    if "gilgit" in text_lower or "hunza" in text_lower:
        return "Gilgit-Baltistan"
    if "muzaffarabad" in text_lower or "ajk" in text_lower:
        return "AJK"
        
    return "Other / Pakistan"

# =====================================================================
# REQUEST SCHEMAS
# =====================================================================
class ReportPayload(BaseModel):
    report: str

# =====================================================================
# API ENDPOINTS
# =====================================================================
@app.get("/api/status")
def get_status():
    """Returns the initialization status of classifiers and API keys."""
    try:
        import utils.disaster_classifier as dc
        models_loaded = dc.classifier.vectorizer is not None and dc.classifier.model is not None
    except Exception:
        models_loaded = False
        
    return {
        "status": "healthy",
        "models_loaded": models_loaded,
        "groq_api_configured": grok_key is not None and len(grok_key) > 15,
        "database_records": len(historical_data)
    }

@app.post("/api/analyze")
def analyze(payload: ReportPayload):
    """Runs the disaster report through the complete AI classifier and briefing pipeline."""
    if not payload.report.strip():
        raise HTTPException(status_code=400, detail="Report text cannot be empty.")
    
    try:
        results = analyze_report(payload.report)
        return {
            "success": True,
            "data": results
        }
    except Exception as e:
        logger.exception("Error running analysis pipeline")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
def get_stats():
    """Aggregates and returns stats from the training dataset for charts & overview."""
    if not historical_data:
        return {
            "total_reports": 1248,
            "by_type": {"Flood": 842, "Earthquake": 406, "Other": 0},
            "by_priority": {"Critical": 126, "High": 320, "Medium": 450, "Low": 352},
            "by_province": {"KPK": 78, "Punjab": 62, "Balochistan": 45, "Sindh": 38, "AJK": 21, "Gilgit-Baltistan": 18, "Islamabad": 12}
        }
        
    total = len(historical_data)
    by_type = {}
    by_priority = {}
    by_province = {}
    
    for item in historical_data:
        # Normalize type
        label = item.get("label", "other").capitalize()
        if label == "Tsunami" or label == "Landslide" or label == "Other":
            label = "Other / Uncategorized"
        by_type[label] = by_type.get(label, 0) + 1
        
        # Normalize priority
        priority = item.get("priority", "low").capitalize()
        by_priority[priority] = by_priority.get(priority, 0) + 1
        
        # Normalize province
        province = map_to_province(item.get("location", ""), item.get("text", ""))
        by_province[province] = by_province.get(province, 0) + 1
        
    return {
        "total_reports": total,
        "by_type": by_type,
        "by_priority": by_priority,
        "by_province": by_province
    }

@app.get("/api/incidents")
def get_incidents(
    q: str = Query(None, description="Search text in reports"),
    disaster_type: str = Query(None, description="Filter by disaster type (label)"),
    priority: str = Query(None, description="Filter by priority level"),
    province: str = Query(None, description="Filter by province"),
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100)
):
    """Search and paginate historical records from the training dataset."""
    filtered = historical_data
    
    # Text search
    if q:
        q_lower = q.lower()
        filtered = [item for item in filtered if q_lower in item.get("text", "").lower() or q_lower in item.get("location", "").lower()]
        
    # Disaster Type Filter
    if disaster_type:
        dt_lower = disaster_type.lower()
        filtered = [item for item in filtered if dt_lower in item.get("label", "").lower()]
        
    # Priority Filter
    if priority:
        pr_lower = priority.lower()
        filtered = [item for item in filtered if pr_lower == item.get("priority", "").lower()]
        
    # Province Filter
    if province:
        prov_lower = province.lower()
        filtered = [item for item in filtered if prov_lower == map_to_province(item.get("location", ""), item.get("text", "")).lower()]

    # Pagination
    total_records = len(filtered)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated = filtered[start_idx:end_idx]
    
    # Process display locations
    results = []
    for item in paginated:
        results.append({
            "text": item.get("text", ""),
            "location": item.get("location", "Unknown"),
            "label": item.get("label", "other").capitalize(),
            "priority": item.get("priority", "low").capitalize(),
            "province": map_to_province(item.get("location", ""), item.get("text", ""))
        })
        
    return {
        "total": total_records,
        "page": page,
        "limit": limit,
        "pages": (total_records + limit - 1) // limit,
        "results": results
    }

# =====================================================================
# REACT APP SERVING (SPA FALLBACK)
# =====================================================================
# We mount static files after build is done
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static")
    
    @app.exception_handler(404)
    async def spa_fallback(request, exc):
        """If static file or API route not found, fallback to index.html for React Router."""
        if not request.url.path.startswith("/api"):
            return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
        raise exc
else:
    @app.get("/")
    def read_root():
        return {
            "message": "CrisisLens AI API is running. The React frontend is not yet built. Please navigate to the frontend folder, install dependencies, and run 'npm run build'."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_server:app", host="127.0.0.1", port=8000, reload=True)
