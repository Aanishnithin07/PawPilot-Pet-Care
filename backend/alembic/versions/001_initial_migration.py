"""Initial migration with Firebase UID support

Revision ID: 001
Revises: 
Create Date: 2025-01-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table with Firebase UID
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('firebase_uid', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('hashed_password', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_firebase_uid'), 'users', ['firebase_uid'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    
    # Create pets table
    op.create_table('pets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('breed', sa.String(), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('weight', sa.Float(), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pets_id'), 'pets', ['id'], unique=False)
    op.create_index(op.f('ix_pets_name'), 'pets', ['name'], unique=False)
    
    # Create vaccinations table
    op.create_table('vaccinations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('vaccine_name', sa.String(), nullable=True),
        sa.Column('date_given', sa.Date(), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('pet_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['pet_id'], ['pets.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_vaccinations_id'), 'vaccinations', ['id'], unique=False)
    op.create_index(op.f('ix_vaccinations_vaccine_name'), 'vaccinations', ['vaccine_name'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_vaccinations_vaccine_name'), table_name='vaccinations')
    op.drop_index(op.f('ix_vaccinations_id'), table_name='vaccinations')
    op.drop_table('vaccinations')
    op.drop_index(op.f('ix_pets_name'), table_name='pets')
    op.drop_index(op.f('ix_pets_id'), table_name='pets')
    op.drop_table('pets')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_firebase_uid'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')