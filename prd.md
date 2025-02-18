# Product Requirement Document (PRD)

## 1. Overview & Goals

**Project Name:** Battery Storage Arbitrage Optimizer  
**Owner:** Antonio & Backend Team  
**Objective:** Develop an AWS-based backend system to optimize battery storage arbitrage using power marginal local (PML) price data. The system will determine the best charging/discharging strategy to maximize revenue based on historical pricing data.

## 2. Technical Requirements

### **Core Tech Stack:**
- **Backend:** TypeScript (Node.js)
- **Infrastructure:** AWS Lambda, API Gateway (deployed via Terraform)
- **Testing:** Vitest (TDD approach)
- **Monorepo Management:** Turborepo
- **Deployment:** Terraform CLI
- **Data Source:** API from Batu Energy (No data storage, fetch at runtime)

### **Core Features:**
1. **Optimize Battery Storage Arbitrage Strategy**
   - Fetch market data from Batu Energy API
   - Process PML prices and optimize charge/discharge strategy
   - Compare different optimization algorithms (initial MVP will support multiple approaches)

2. **REST API Endpoints:**
   - `POST /optimize`: Accepts battery parameters and market conditions, returns optimized daily schedule.

3. **Testing & Validation:**
   - Unit tests for individual functions
   - Integration tests for full system validation

4. **Deployment & Infrastructure:**
   - AWS Lambda for computation
   - API Gateway for request handling
   - Terraform for IaC deployment

## 3. System Architecture

### **MVP System Diagram:**
```
Client → API Gateway → AWS Lambda (Optimization Engine) → Batu Energy API
```
- All computations happen **at runtime**
- **No data storage** (prices are fetched on demand)
- **No CI/CD** initially (manual Terraform CLI deployments)

## 4. Monorepo Structure

We will use **Turborepo** to manage the backend, infrastructure, and future frontend components in a monorepo.

```
📂 batu-energy-monorepo
├── 📂 apps
│   ├── 📂 backend  # AWS Lambda (TypeScript)
│   ├── 📂 frontend # Future visualization module
├── 📂 packages
│   ├── 📂 shared   # Shared utilities (if needed)
├── 📂 infra        # Terraform Infrastructure as Code (IaC)
├── 📄 turbo.json   # Turborepo config
```

## 5. API Design & Optimization Strategy

### **API: POST /optimize**
**Request:**
```json
{
    "battery_params": {
        "capacity_mw": 10,
        "duration_hours": 4,
        "efficiency": 0.85,
        "min_soc": 0.1,
        "max_soc": 1.0
    },
    "market_params": {
        "zone": "APATZINGAN",
        "start_date": "2024-01-01T00:00:00Z",
        "end_date": "2024-01-31T23:59:59Z"
    }
}
```

**Response:**
```json
{
    "daily_schedules": [
        {
            "date": "2024-01-01",
            "schedule": [
                { "hour": 0, "action": "charge", "power": 5, "price": 1200, "soc": 0.5 },
                { "hour": 1, "action": "idle", "power": 0, "price": 1250, "soc": 0.5 }
            ],
            "revenue": 1500.00,
            "energy_charged": 20,
            "energy_discharged": 20,
            "avg_charge_price": 1100,
            "avg_discharge_price": 1400
        }
    ],
    "summary": {
        "total_revenue": 45000.00,
        "avg_daily_revenue": 1450.00,
        "best_day": { "date": "2024-01-05", "revenue": 2000 },
        "worst_day": { "date": "2024-01-15", "revenue": 500 }
    }
}
```

## 6. Step-by-Step Implementation Plan

### **Phase 1: Monorepo Setup**
1. Initialize Turborepo project structure.
2. Create `backend`, `infra`, and `frontend` directories (frontend for future use).
3. Set up TypeScript project in `backend`.
4. Set up Terraform configuration in `infra`.

### **Phase 2: API & Lambda Implementation**
1. Implement AWS Lambda function to handle optimization requests.
2. Integrate with Batu Energy API to fetch PML prices.
3. Implement core optimization logic ensuring constraints are met.
4. Develop API Gateway configuration to expose `POST /optimize`.

### **Phase 3: Algorithm Development**
1. Implement basic optimization algorithm for charge/discharge decisions.
2. Incorporate efficiency losses and SOC constraints.
3. Develop comparison logic for multiple optimization strategies.
4. Implement spread-based and cycle-based decision heuristics.

### **Phase 4: Testing & Validation**
1. Write unit tests for battery constraints and optimization logic.
2. Write integration tests for Lambda and API Gateway responses.
3. Validate system with mock and real data from Batu Energy API.

### **Phase 5: Deployment & Documentation**
1. Deploy Lambda function and API Gateway using Terraform CLI.
2. Write a comprehensive README with setup instructions.
3. Document API behavior, request formats, and expected responses.

### **Phase 6: Future Enhancements**
1. Introduce machine learning-based optimization techniques.
2. Add data caching mechanisms for improved performance.
3. Implement security enhancements and authentication mechanisms.
4. Develop a frontend for visualizing optimization results.

## 7. Deployment Strategy
- **Manual Terraform Deployment (for now)**
- Run: `terraform init && terraform apply`
- No CI/CD yet (can be added later)

## 8. Future Improvements
- **Data Storage:** Store PML data in DynamoDB or S3 for caching.
- **Security Enhancements:** Add IAM roles, API Gateway authentication.
- **Optimization Techniques:** Test ML-based optimization models.
- **Frontend Visualization:** Build a dashboard to visualize results.

---

### Next Steps:
1. Complete monorepo setup.
2. Implement Lambda function and API.
3. Develop and compare optimization algorithms.
4. Conduct extensive testing.
5. Deploy the solution using Terraform CLI.

