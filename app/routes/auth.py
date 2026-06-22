from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.services.supabase import get_supabase

router = APIRouter()


class AuthRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    email: str


class SignupResponse(BaseModel):
    user_id: str
    email: str
    message: str


@router.post("/signup")
def signup(req: AuthRequest):
    sb = get_supabase()
    try:
        res = sb.auth.sign_up({"email": req.email, "password": req.password})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not res.user:
        raise HTTPException(status_code=400, detail="Signup failed")

    if res.session:
        return TokenResponse(
            access_token=res.session.access_token,
            refresh_token=res.session.refresh_token,
            user_id=res.user.id,
            email=res.user.email,
        )

    return SignupResponse(
        user_id=res.user.id,
        email=res.user.email,
        message="Check your email to confirm your account",
    )


@router.post("/login", response_model=TokenResponse)
def login(req: AuthRequest):
    sb = get_supabase()
    try:
        res = sb.auth.sign_in_with_password({"email": req.email, "password": req.password})
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    return TokenResponse(
        access_token=res.session.access_token,
        refresh_token=res.session.refresh_token,
        user_id=res.user.id,
        email=res.user.email,
    )


@router.post("/logout")
def logout(access_token: str):
    sb = get_supabase()
    try:
        sb.auth.sign_out(access_token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Logged out"}


@router.delete("/delete-account")
def delete_account(access_token: str):
    sb = get_supabase()
    try:
        user = sb.auth.get_user(access_token)
        if not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")

        sb.auth.admin.delete_user(user.user.id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Account deleted"}
