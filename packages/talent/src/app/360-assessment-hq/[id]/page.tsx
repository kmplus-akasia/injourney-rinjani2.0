import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

export default function CycleDetailRedirect() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/talent/360-assessment-hq/${id}/assessors`, { replace: true });
  }, [id, navigate]);

  return null;
}
