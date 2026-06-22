"""Validation of calculate_phenoage against known sources."""

from app.services.phenoage import calculate_phenoage, convert_us_to_si


# === Test Case 1 ===
# From omux.dev blog — expected output: ~54.63
alb, cre, glu, crp = convert_us_to_si(4.1, 0.73, 94, 1.9)
result1 = calculate_phenoage(
    albumin=alb, creatinine=cre, glucose=glu, crp=crp,
    lymphocyte_percent=27.78, mcv=88, rdw=13.6,
    alkaline_phosphatase=48, wbc=3.9, age=64.12,
)
print(f"Test 1 (omux.dev blog):   {result1:.2f}  (expected: ~54.63)")


# === Test Case 2 ===
# From MCP PhenoAge repo — CRP in mg/L
alb, cre, glu, crp = convert_us_to_si(4.2, 0.9, 85, 0.5)
result2 = calculate_phenoage(
    albumin=alb, creatinine=cre, glucose=glu, crp=crp,
    lymphocyte_percent=30, mcv=89, rdw=12.5,
    alkaline_phosphatase=65, wbc=6.2, age=45,
)
print(f"Test 2 (MCP repo, 45yo):  {result2:.2f}  (expect around or below 45)")


# === Test Case 3 ===
# Healthy 30-year-old
alb, cre, glu, crp = convert_us_to_si(4.5, 0.9, 90, 3.0)
result3 = calculate_phenoage(
    albumin=alb, creatinine=cre, glucose=glu, crp=crp,
    lymphocyte_percent=32, mcv=90, rdw=12.5,
    alkaline_phosphatase=55, wbc=6.0, age=30,
)
print(f"Test 3 (healthy 30yo):    {result3:.2f}  (expect around or below 30)")


# === Test Case 4 ===
# Unhealthy 50-year-old with elevated markers
alb, cre, glu, crp = convert_us_to_si(3.5, 1.3, 130, 30.0)
result4 = calculate_phenoage(
    albumin=alb, creatinine=cre, glucose=glu, crp=crp,
    lymphocyte_percent=18, mcv=95, rdw=15.5,
    alkaline_phosphatase=120, wbc=9.5, age=50,
)
print(f"Test 4 (unhealthy 50yo):  {result4:.2f}  (expect well above 50)")
