"""
AURA SQLAlchemy Database Models
Strictly typed relational models mapping to Phase 1 Schema.
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class QueryModel(Base):
    __tablename__ = "queries"

    id = Column(String, primary_key=True, index=True)
    query_text = Column(String, nullable=False, index=True)
    intent = Column(String, nullable=False)
    model = Column(String, nullable=False)
    is_pro = Column(Boolean, default=False)
    ai_summary = Column(Text, nullable=False)
    latency_ms = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    citations = relationship("CitationModel", back_populates="query", cascade="all, delete-orphan")

class CitationModel(Base):
    __tablename__ = "citations"

    id = Column(String, primary_key=True, index=True)
    query_id = Column(String, ForeignKey("queries.id", ondelete="CASCADE"), nullable=False)
    citation_index = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    domain = Column(String, nullable=False)
    url = Column(String, nullable=False)
    trust_score = Column(Float, default=0.98)

    query = relationship("QueryModel", back_populates="citations")

class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    word_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BookmarkModel(Base):
    __tablename__ = "bookmarks"

    id = Column(String, primary_key=True, index=True)
    query = Column(String, nullable=False)
    model = Column(String, nullable=False)
    snippet = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SearchTrendModel(Base):
    __tablename__ = "search_trends"

    id = Column(String, primary_key=True, index=True)
    keyword = Column(String, unique=True, nullable=False, index=True)
    category = Column(String, nullable=False)
    volume = Column(String, nullable=False)
    surge_rate = Column(String, nullable=False)
    velocity_score = Column(Integer, default=100)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
