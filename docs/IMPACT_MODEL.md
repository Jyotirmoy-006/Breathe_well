# SaafSaans Impact Estimation Model & Intervention Catalog

## 1. Overview & Modeling Philosophy

SaafSaans (साफ़ साँस) models personal particulate exposure ($PM_{2.5}$) and greenhouse gas emissions averted ($CO_2e$) across four distinct intervention categories: **Daily Routine**, **Home Air**, **Sustainable Swaps**, and **Community Actions**.

A foundational principle of SaafSaans is **Data and Model Honesty**:

1. **Zero Hallucinated Numbers:** LLMs are never permitted to invent exposure percentages or carbon savings. All quantitative values originate from vetted empirical literature or explicit mathematical equations.
2. **Multiplicative Non-Double-Counting:** When multiple air protection actions are adopted simultaneously (e.g., sealing windows, running a HEPA filter, and wearing an N95 mask), their benefits are **not** added together linearly (which would absurdly exceed 100%). Instead, they are combined multiplicatively.
3. **Physical Efficiency Ceiling:** No indoor or personal intervention achieves 100% total particulate exclusion due to real-world mask fit leaks, door openings, and building infiltration. We enforce a strict **85% physical ceiling** on combined exposure reduction.
4. **Transparent Epistemic Confidence:** Every catalog entry is explicitly assigned a confidence grade: `high` (peer-reviewed empirical literature or national standards), `medium` (established engineering models), or `assumption` (unvalidated engineering approximations).

---

## 2. Mathematical Formulations

### 2.1 Multiplicative Particulate Exposure Reduction ($PM_{2.5}$)

Let $\{a_1, a_2, \dots, a_n\}$ be the set of active actions selected by the user. Each action $a_i$ provides a fractional particulate reduction $r_i \in [0, 1]$ (where $r_i = \text{pct}_i / 100$).

The residual fractional exposure after applying all independent filtration and avoidance barriers is:

$$\text{Residual Exposure} = \prod_{i=1}^{n} (1 - r_i)$$

The aggregate exposure reduction percentage $R$ is therefore:

$$R_{\text{raw}} = \left( 1 - \prod_{i=1}^{n} (1 - r_i) \right) \times 100$$

To account for real-world infiltration and imperfect seal factors:

$$R = \min\left(85.0\%, R_{\text{raw}}\right)$$

Both **low-bound** ($r_{i,\text{low}}$) and **high-bound** ($r_{i,\text{high}}$) reductions are computed separately to report a realistic interval rather than a false point precision.

---

### 2.2 Additive Greenhouse Gas Abatement ($CO_2e$)

Unlike particulate filtration (which acts on the same inhaled air stream in series), greenhouse gas emission reductions from fuel switching and transport substitution act on independent fossil emission sources.

Therefore, emissions savings are strictly **additive**:

$$\Delta CO_2e_{\text{week}} = \sum_{i=1}^{n} \text{co2e}_{i,\text{week}} \quad [\text{kg } CO_2e / \text{week}]$$

$$\Delta CO_2e_{\text{year}} = \Delta CO_2e_{\text{week}} \times 52.14 \quad [\text{kg } CO_2e / \text{year}]$$

---

## 3. Comprehensive Intervention Catalog (~30 Actions)

### 3.1 Routine Actions (Daily Habits & Timing)

| ID                            | Title & Description                                                                    | PM2.5 Red. [%] | CO2e [kg/wk] | Effort | Cost | Basis & Mechanism                                              | Confidence | Evidence Source                                         |
| ----------------------------- | -------------------------------------------------------------------------------------- | -------------- | ------------ | ------ | ---- | -------------------------------------------------------------- | ---------- | ------------------------------------------------------- |
| `routine-morning-ventilation` | **Midday ventilation window:** Open windows only between 12 PM - 3 PM.                 | 10% – 20%      | 0.0 – 0.0    | Low    | Free | Exploits solar breakdown of nocturnal ground-level inversion.  | `medium`   | CPCB & IIT Delhi boundary-layer dispersion studies      |
| `routine-midday-exercise`     | **Shift exertion to midday:** Reschedule workouts to 1 PM - 4 PM.                      | 25% – 45%      | 0.0 – 0.0    | Med    | Free | Avoids morning and late evening diurnal particulate peaks.     | `high`     | WHO Air Quality Guidelines 2021; SAFAR diurnal tracking |
| `routine-seal-windows`        | **Seal window gaps & sweeps:** Apply foam weatherstripping along exterior door cracks. | 15% – 30%      | 0.0 – 0.0    | Low    | Low  | Reduces passive ambient particulate infiltration rate.         | `medium`   | US EPA Indoor Air Quality building envelope benchmarks  |
| `routine-wet-mopping`         | **Wet-mopping over sweeping:** Use damp microfiber mops instead of dry brooms.         | 10% – 25%      | 0.0 – 0.0    | Low    | Free | Eliminates mechanical resuspension of settled indoor dust.     | `high`     | CPCB indoor dust control guidelines                     |
| `routine-n95-commute`         | **Fitted N95 respirator:** Wear certified N95/FFP2 respirator outdoors.                | 50% – 80%      | 0.0 – 0.0    | Low    | Low  | Electrostatic mechanical filtration of submicron particulates. | `high`     | NIOSH & WHO PPE filtration efficiency standards         |
| `routine-car-recirc`          | **Car AC recirculation:** Keep vehicular HVAC in cabin recirculation mode.             | 35% – 65%      | 0.0 – 0.0    | Low    | Free | Prevents direct intake of adjacent tailpipe exhaust.           | `high`     | Hudda et al. (2012) cabin particulate ingress studies   |
| `routine-shoes-outside`       | **Leave shoes at door:** Keep street footwear on outside shoe racks.                   | 5% – 15%       | 0.0 – 0.0    | Low    | Free | Prevents tracking road silt and tyre wear particles into rugs. | `medium`   | US EPA soil and dust track-in prevention studies        |
| `routine-clean-ac-filters`    | **Clean AC pre-filters:** Wash room split-AC dust filters weekly.                      | 5% – 12%       | 0.2 – 0.5    | Low    | Free | Preserves HVAC airflow and captures coarse ambient dust.       | `medium`   | ASHRAE filtration maintenance guidelines                |

---

### 3.2 Home Air Actions (Indoor Mitigation & Filtration)

| ID                              | Title & Description                                                                | PM2.5 Red. [%] | CO2e [kg/wk] | Effort | Cost | Basis & Mechanism                                                       | Confidence | Evidence Source                                       |
| ------------------------------- | ---------------------------------------------------------------------------------- | -------------- | ------------ | ------ | ---- | ----------------------------------------------------------------------- | ---------- | ----------------------------------------------------- |
| `home-diy-box-fan-hepa`         | **DIY Corsi-Rosenthal box cleaner:** Box fan taped to MERV 13/HEPA filter panels.  | 40% – 75%      | 0.0 – 0.0    | Med    | Low  | Delivers high clean air delivery rate (CADR) in closed rooms.           | `high`     | UC Davis & US EPA Corsi-Rosenthal evaluations         |
| `home-cross-ventilation-midday` | **Timed cross-ventilation:** 20-minute flush during midday solar peak.             | 10% – 20%      | 0.0 – 0.0    | Low    | Free | Controlled air exchange during lowest diurnal ambient smog.             | `medium`   | CPCB & building ventilation engineering standards     |
| `home-avoid-incense`            | **Eliminate agarbatti & coils:** Cease burning dhoop, agarbatti, or coils indoors. | 20% – 50%      | 0.1 – 0.3    | Low    | Free | Direct source elimination of indoor PM2.5 spikes (>300 µg/m³).          | `high`     | Indian Chest Society & CPCB indoor emissions research |
| `home-exhaust-hood-cooking`     | **Range hood / exhaust during cooking:** Run kitchen exhaust while frying/tadka.   | 15% – 35%      | 0.0 – 0.0    | Low    | Free | Captures oil aerosols and combustion products at generation source.     | `high`     | Lawrence Berkeley National Lab indoor cooking study   |
| `home-door-damp-towel-sealing`  | **Damp towel draft stopper:** Place rolled damp towels under balcony doors.        | 8% – 18%       | 0.0 – 0.0    | Low    | Free | Simple acoustic/crack sealing reducing perimeter infiltration.          | `medium`   | National Institute of Environmental Health Sciences   |
| `home-bedroom-clean-sanctuary`  | **Dedicated clean air bedroom:** Seal and filter one primary sleeping room.        | 35% – 60%      | 0.0 – 0.0    | Med    | Low  | Ensures 8 hours of low particulate inhalation during restorative sleep. | `high`     | WHO Indoor Air Quality Guidelines 2021                |
| `home-vacuum-hepa-bag`          | **HEPA-filtered vacuuming:** Vacuum carpets with sealed HEPA exhaust bags.         | 10% – 20%      | 0.0 – 0.0    | Med    | Med  | Retains fine particles that bypass standard cyclonic vacuums.           | `medium`   | Allergy & Asthma Foundation of America standards      |

---

### 3.3 Sustainable Swaps (Fuel, Transport, & Technology Transitions)

| ID                             | Title & Description                                                                       | PM2.5 Red. [%] | CO2e [kg/wk] | Effort | Cost | Basis & Mechanism                                                           | Confidence | Evidence Source                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------- | -------------- | ------------ | ------ | ---- | --------------------------------------------------------------------------- | ---------- | ------------------------------------------------------ |
| `swap-biomass-to-induction`    | **Solid fuel to induction cooktop:** Replace wood/coal with electric induction.           | 70% – 90%      | 15.0 – 28.0  | High   | Med  | Eliminates solid fuel smoke emissions; replaces fossil cooking.             | `high`     | WHO household fuel combustion guidelines; IPCC factors |
| `swap-electric-heater-angithi` | **Angithi to electric radiant heater:** Replace coal braziers with oil-filled radiator.   | 60% – 85%      | 8.0 – 16.0   | Med    | Med  | Abates carbon monoxide, black carbon, and extreme indoor soot.              | `high`     | CPCB & MoEFCC winter source apportionment reports      |
| `swap-carpool-electric-bus`    | **Solo car to Metro / Electric bus:** Shift commute to public electric transit.           | 20% – 40%      | 12.0 – 24.0  | Med    | Free | Reduces commuter exhaust exposure and eliminates tailpipe CO2.              | `high`     | Delhi Metro Rail Corporation carbon emissions ledger   |
| `swap-two-wheeler-ev`          | **Petrol two-wheeler to electric scooter:** Shift personal transit to zero-emission EV.   | 15% – 30%      | 4.0 – 9.0    | Med    | High | Eliminates unburned hydrocarbon and roadside aerosol exposure.              | `high`     | Bureau of Energy Efficiency (BEE) EV emission factors  |
| `swap-solar-water-heater`      | **Install rooftop solar water heater:** Pre-heat bathing water with solar thermal panels. | 0% – 5%        | 6.0 – 14.0   | High   | High | Displaces winter peak grid electricity and water geyser loads.              | `medium`   | Ministry of New & Renewable Energy (MNRE) benchmarks   |
| `swap-briquette-cowdung`       | **Compressed biomass briquettes:** Replace loose cow-dung cakes with smokeless pellets.   | 30% – 50%      | 5.0 – 10.0   | Med    | Low  | Higher combustion efficiency, lower volatile organic compounds.             | `medium`   | IIT Kanpur rural biomass combustion trials             |
| `swap-led-lighting-efficiency` | **Full LED retrofit:** Upgrade legacy compact incandescent/halogens to LED.               | 0% – 2%        | 1.5 – 3.5    | Low    | Low  | Reduces societal electricity demand and thermal power generation emissions. | `high`     | Bureau of Energy Efficiency UJALA scheme audits        |

---

### 3.4 Community & Collective Actions (RWAs, Schools, & Civic Groups)

| ID                                 | Title & Description                                                                    | PM2.5 Red. [%] | CO2e [kg/wk] | Effort | Cost | Basis & Mechanism                                                      | Confidence | Evidence Source                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------- | -------------- | ------------ | ------ | ---- | ---------------------------------------------------------------------- | ---------- | ------------------------------------------------------------- |
| `community-school-indoor-assembly` | **Move school sports/assembly indoors:** Suspend outdoor activities on Severe days.    | 30% – 60%      | 0.0 – 0.0    | Med    | Free | Protects children from high minute-volume lung deposition.             | `high`     | Directorate of Education winter pollution advisories          |
| `community-guard-electric-heaters` | **RWA heaters for night guards:** Provide radiant heaters in security guard posts.     | 25% – 50%      | 4.0 – 9.0    | Low    | Low  | Abates localized open night fires of scrap wood and plastics.          | `high`     | Commission for Air Quality Management (CAQM) directives       |
| `community-anti-burning-patrol`    | **Anti-waste-burning vigil:** Monitor neighborhood and report via Green Delhi App.     | 15% – 35%      | 10.0 – 25.0  | Med    | Free | Deterrence and rapid civic extinguishment of illegal leaf/trash fires. | `medium`   | Delhi Pollution Control Committee (DPCC) reports              |
| `community-water-sprinkling`       | **RWA perimeter misting / road sprinkling:** Wet unpaved internal society roads.       | 15% – 30%      | 0.0 – 0.0    | Low    | Low  | Suppresses mechanical road dust resuspension from car tyres.           | `medium`   | CPCB Comprehensive Clean Air Action Plan for NCR              |
| `community-shuttle-metro`          | **Apartment shared EV feeder shuttle:** RWA-managed electric shuttle to nearest metro. | 20% – 45%      | 18.0 – 38.0  | High   | Med  | Consolidates hundreds of short solo car trips into single shared EV.   | `high`     | TERI urban mobility and RWA modal split studies               |
| `community-compost-leaves`         | **Society horticulture composting pits:** Compost garden trimmings on-site.            | 10% – 25%      | 6.0 – 15.0   | Med    | Low  | Eliminates open incineration of autumn fallen dry leaves.              | `high`     | Solid Waste Management Rules 2016; CPCB composting guidelines |
| `community-construction-covers`    | **Enforce construction tarping & green mesh:** Cover open building aggregate piles.    | 15% – 30%      | 0.0 – 0.0    | Low    | Free | Prevents wind erosion and dispersal of silica and cement dust.         | `medium`   | CAQM Graded Response Action Plan (GRAP) Stage III/IV          |

---

## 4. Model Limitations & Ongoing Validation

1. **Microenvironmental Heterogeneity:** Building infiltration factors ($F_{\text{inf}}$) vary between modern sealed apartments ($F_{\text{inf}} \approx 0.35$) and unsealed brick dwellings ($F_{\text{inf}} \approx 0.70$).
2. **Individual Compliance & Fit Factor:** N95 mask protection ranges from 50% for poorly fitted respirators to >90% for professionally fit-tested masks with shaved facial skin.
3. **Meteorological Feedback:** Localized misting and sprinkling suppress resuspension but do not alter secondary sulfate and nitrate aerosol formation driven by regional ammonia and humidity.
