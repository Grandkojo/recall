import os
from dotenv import load_dotenv
from urllib.parse import urlparse
load_dotenv()
os.environ["ENABLE_BACKEND_ACCESS_CONTROL"] = "false"

# Set up relational db env vars for pgvector BEFORE importing cognee
db_url = os.getenv("DATABASE_URL")
if db_url:
    parsed = urlparse(db_url)
    os.environ["DB_PROVIDER"] = "postgres"
    os.environ["DB_HOST"] = parsed.hostname or ""
    os.environ["DB_PORT"] = str(parsed.port or 5432)
    os.environ["DB_NAME"] = parsed.path.lstrip("/")
    os.environ["DB_USERNAME"] = parsed.username or ""
    os.environ["DB_PASSWORD"] = parsed.password or ""

import cognee
def setup_cognee():
    # OpenAI Embeddings
    cognee.config.set_embedding_provider("openai")
    cognee.config.set_embedding_model("text-embedding-3-small")
    
    # Vector DB (Neon Postgres via pgvector)
    # Using the same database url used by sqlalchemy
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        cognee.config.set_vector_db_provider("pgvector")
        cognee.config.set_vector_db_url(db_url)
    
    # Graph DB (Neo4j Aura)
    neo4j_uri = os.getenv("NEO4J_URI")
    neo4j_user = os.getenv("NEO4J_USERNAME")
    neo4j_pass = os.getenv("NEO4J_PASSWORD")
    
    if neo4j_uri and neo4j_user and neo4j_pass:
        cognee.config.set_graph_database_provider("neo4j")
        cognee.config.set_graph_db_config({
            "graph_database_url": neo4j_uri,
            "graph_database_username": neo4j_user,
            "graph_database_password": neo4j_pass,
        })
