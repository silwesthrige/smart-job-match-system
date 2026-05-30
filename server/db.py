import os
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URI)
db = client['smart_job_match']

async def setup_db():
    """Create indexes for performance and deduplication."""
    print("Setting up database indexes...")
    # Users index
    await db.users.create_index("email", unique=True)
    
    # Jobs indexes
    await db.jobs.create_index("url", unique=True)
    await db.jobs.create_index("title")
    await db.jobs.create_index("skills")
    await db.jobs.create_index("created_at")
    
    # CVs indexes
    await db.cvs.create_index("user_id")
    await db.cvs.create_index("created_at")
    print("Database setup complete.")

if __name__ == "__main__":
    # Allow running this file directly to setup indexes
    loop = asyncio.get_event_loop()
    loop.run_until_complete(setup_db())
