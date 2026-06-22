import math


def convert_us_to_si(
    albumin: float,
    creatinine: float,
    glucose: float,
    crp: float,
) -> tuple[float, float, float, float]:
    """Convert US lab units to SI units expected by the PhenoAge formula.

    Input (US lab):          Output (SI):
        albumin   g/dL   →   g/L       (× 10)
        creatinine mg/dL →   umol/L    (× 88.401)
        glucose   mg/dL  →   mmol/L    (× 0.0555)
        crp       mg/L   →   mg/dL     (× 0.1)
    """
    return (
        albumin * 10,
        creatinine * 88.401,
        glucose * 0.0555,
        crp * 0.1,
    )


def calculate_phenoage(
    albumin: float,
    creatinine: float,
    glucose: float,
    crp: float,
    lymphocyte_percent: float,
    mcv: float,
    rdw: float,
    alkaline_phosphatase: float,
    wbc: float,
    age: float,
) -> float:
    """Calculate Levine 2018 PhenoAge from 9 biomarkers + chronological age.

    Units expected (per original paper Table 1):
        albumin:                g/L
        creatinine:             umol/L
        glucose:                mmol/L
        crp:                    mg/dL  (log-transformed internally)
        lymphocyte_percent:     %
        mcv:                    fL
        rdw:                    %
        alkaline_phosphatase:   U/L
        wbc:                    1000 cells/uL
        age:                    years
    """
    # Step 1: Linear combination of biomarkers
    xb = (
        -19.907
        - 0.0336 * albumin
        + 0.0095 * creatinine
        + 0.1953 * glucose
        + 0.0954 * math.log(crp)
        - 0.0120 * lymphocyte_percent
        + 0.0268 * mcv
        + 0.3306 * rdw
        + 0.00188 * alkaline_phosphatase
        + 0.0554 * wbc
        + 0.0804 * age
    )

    # Step 2: 10-year mortality risk via Gompertz distribution
    GOMPERTZ_AGING_RATE = 0.0076927
    mortality_risk = 1 - math.exp(
        -math.exp(xb)
        * (math.exp(120 * GOMPERTZ_AGING_RATE) - 1)
        / GOMPERTZ_AGING_RATE
    )

    # Step 3: Convert mortality risk back to phenotypic age
    phenoage = 141.50225 + math.log(-0.00553 * math.log(1 - mortality_risk)) / 0.090165

    return phenoage
