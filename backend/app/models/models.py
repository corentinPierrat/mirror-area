from sqlalchemy import Column, String, Text, Enum, ForeignKey, JSON, DateTime, BigInteger, Integer, VARBINARY, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    profile_image_url = Column(String(512), nullable=True)
    role = Column(Enum("user", "admin", name="user_roles"), nullable=False, default="user")
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(255), nullable=True)
    verification_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    workflows = relationship("Workflow", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("UserFavoriteWorkflow", back_populates="user", cascade="all, delete-orphan")
    friends = relationship("Friend", foreign_keys="[Friend.user_id]", back_populates="user", cascade="all, delete-orphan")
    services = relationship("UserService", back_populates="user", cascade="all, delete-orphan")


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    visibility = Column(Enum("public", "private", "friend_only", name="workflow_visibility"), default="private")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="workflows")
    steps = relationship("WorkflowStep", back_populates="workflow", cascade="all, delete-orphan")
    favorites = relationship("UserFavoriteWorkflow", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowStep(Base):
    __tablename__ = "workflow_steps"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    workflow_id = Column(BigInteger, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    step_order = Column(Integer, nullable=False)
    type = Column(Enum("action", "reaction", "transformation", name="step_types"), nullable=False)
    service = Column(String(100), nullable=False)
    event = Column(String(100), nullable=False)
    params = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    workflow = relationship("Workflow", back_populates="steps")


class UserFavoriteWorkflow(Base):
    __tablename__ = "user_favorite_workflows"

    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    workflow_id = Column(BigInteger, ForeignKey("workflows.id", ondelete="CASCADE"), primary_key=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="favorites")
    workflow = relationship("Workflow", back_populates="favorites")


class Friend(Base):
    __tablename__ = "friends"

    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    friend_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    status = Column(Enum("pending", "accepted", name="friend_status"), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id], back_populates="friends")
    friend = relationship("User", foreign_keys=[friend_id])


class UserService(Base):
    __tablename__ = "user_services"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    service_key = Column(String(64), nullable=False)
    token_data = Column(VARBINARY(2048), nullable=False)
    token_iv = Column(VARBINARY(16), nullable=False)
    token_tag = Column(VARBINARY(16), nullable=False)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="services")
