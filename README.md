# Batu Energy - Backend dev code challenge

## Setup

This project was created using a turbo monorepo with npm as package manager.

`Apps`:
- api: an Express server in typescript with a lambda function
- web: a Next.js app 

`Infra`:
- Uses Terraform to create the infrastructure in AWS.

`Packages`:
- @repo/eslint-config: ESLint configurations used throughout the monorepo
- @repo/jest-presets: Jest configurations
- @repo/logger: isomorphic logger (a small wrapper around console.log)
- @repo/ui: a dummy React UI library (which contains <CounterButton> and <Link> components)
- @repo/typescript-config: tsconfig.json's used throughout the monorepo

## How to run

1. Clone the repository
2. Run `npm install` to install the dependencies
3. Run `npm run dev` to start all apps

---

## Deploy to AWS

The project uses terraform to deploy the infrastructure in AWS.


## Building and Deploying Lambda

1. Add your AWS credentials to the `.env` file. Follow this [tutorial](https://medium.com/@CloudTopG/discover-the-3-steps-to-creating-an-iam-user-with-access-secret-access-keys-for-terraform-scripts-28110e280460) to create an IAM user with access to the AWS account.

```
AWS_REGION=
AWS_ACCOUNT_ID=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

1. Build the Lambda function:
```bash
cd apps/api
npm run build:lambda
npm run package:lambda
```

2. Deploy API Gateway and Lambda function with Terraform:
```bash
cd ./infra
terraform init
terraform apply
```

3. Test the deployed endpoint:
```bash
curl -X POST $(terraform output -raw api_url)/optimize \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

# Code Challenge: Battery Storage Arbitrage Optimizer

## Introducción

¡Hola! Este caso práctico tiene como objetivo evaluar tus habilidades de desarrollo backend y aprendizaje rápido. No buscamos una respuesta correcta, si no aprender sobre tu forma de pensar y trabajar.

**Recomendaciones generales:**

- Diviértete, aprende cosas nuevas y experimenta: aprovecha el tiempo que vas a dedicar a resolver este code challenge para usar tu creatividad y aprender cosas nuevas.
- Usa Claude y/o Cursor: al crear tu cuenta en Cursor tienes una semana gratis de uso del producto. También puedes usar Claude, contáctanos si te interesa usarlo y te daremos una cuenta premium para que lo uses sin límite durante el code challenge.
- Sigue la filosofía de ["do things that don't scale"](https://www.paulgraham.com/ds.html), es un pilar fundamental de la cultura de trabajo en Batu
- Escríbenos: ¡queremos ser parte de tu challenge! Involúcranos tanto como quieras durante el proceso de resolución del challenge.

¡Buena suerte!

## Contexto

En el Mercado Eléctrico Mayorista (MEM) de México, los precios de la energía varían hora a hora en cada nodo del sistema. Los sistemas de almacenamiento de energía pueden aprovechar estas variaciones de precios para generar ingresos mediante arbitraje, cargando cuando los precios son bajos y descargando cuando son altos.

## Objetivo

Desarrollar una API que determine la estrategia óptima de operación de un sistema de almacenamiento de energía para maximizar ingresos por arbitraje de precios nodales, considerando las restricciones técnicas del sistema de almacenamiento y la eficiencia del ciclo de carga/descarga. Por simplicidad para este caso, considera únicamente los ingresos por arbitraje de energía.

## Datos de Entrada

Se proporcionará un API key para la API de Batu Energy MEM, donde podrás consultar los PMLs históricos por zona.

## **PML Zones API Endpoint**

## **Overview**

This endpoint retrieves Power Marginal Local (PML) prices for a specific load zone within a given date range.

## **Endpoint Details**

- **URL**: /pml/zones
- **Method**: GET
- **Authentication**: Required (API Key)

## **Query Parameters**

```markdown
| Parameter      | Type    | Required | Description                                        | Example               |
| -------------- | ------- | -------- | -------------------------------------------------- | --------------------- |
|  load_zone_id  | string  | Yes      | Identifier of the load zone                         |  APATZINGAN          |
|  date_start    | string  | Yes      | Start date and time in YYYY-MM-DD HH:mm:ss format     |  2016-01-31 00:00:00 |
|  date_end      | string  | Yes      | End date and time in YYYY-MM-DD HH:mm:ss format       |  2016-02-01 00:00:00 |
```

## **Response Format**

### **Success Response (200)**

```json
**{ 
	"status": "success", 
	"items": 24, 
	"data": [ 
			{ 
				"load_zone_id": "APATZINGAN", 
				"timestamp": "2016-01-31 00:00:00", 
				"date": "2016-01-31", 
				"hour": "00", 
				"pml": 1234.56, 
				"pml_cng": 100.00, 
				"pml_ene": 1000.00, 
				"pml_per": 134.56 
			}, 
		// ... additional records 
		]
}**
```

### **Error Response (400)**

```json
**{ "status": "fail", "data": { "message": "<error message>" } }}**
```

## **Error Messages**

```markdown
| Message                                        | Description                                  |
| ---------------------------------------------- | -------------------------------------------- |
| "Load zone ID is required"                     | The load_zone_id parameter is missing        |
| "Both date_start and date_end are required"     | One or both date parameters are missing      |
| "Invalid date format. Use YYYY-MM-DD HH:mm:ss" | Dates provided are not in the correct format |
| "date_start must be before date_end"             | The start date is later than the end date      |
| "No query results"                             | No data found for the specified parameters     |
```

## **Response Fields**

```markdown
| Field          | Type    | Description                         |
| -------------- | ------- | ----------------------------------- |
|  load_zone_id  | string  | Identifier of the load zone           |
|  timestamp     | string  | Date and time of the price record     |
|  date          | string  | Date of the price record             |
|  hour          | string  | Hour of the price record             |
|  pml           | number  | Total Power Marginal Local price      |
|  pml_cng       | number  | Congestion component of PML          |
|  pml_ene       | number  | Energy component of PML              |
|  pml_per       | number  | Losses component of PML              |
```

## **Example Request**

```bash
curl -XGET -H 'x-api-key: [your-api-key]' 'https://api.batuenergy.com/electricity-data/pmls/zone?load_zone_id=APATZINGAN&date_start=2024-01-01%2000:00:00&date_end=2024-02-01%2000:00:00'
```

## **Notes**

- The API returns hourly PML prices within the specified date range
- Dates must be in YYYY-MM-DD HH:mm:ss format
- The maximum date range that can be queried may be limited
- All times are assumed to be in the local timezone of the load zone
- Results are ordered by timestamp in ascending order

Puedes consultar todas las LoadZoneIDs en la columna "Zona de Carga" de este archivo.

## Parámetros del Sistema de Almacenamiento

El sistema debe poder recibir los siguientes parámetros:

- `capacity_mw`: Capacidad de potencia en MW (ej: 10 MW)
- `duration_hours`: Duración en horas (ej: 4 horas → 40 MWh)
- `efficiency`: Eficiencia de ciclo completo (round-trip efficiency) (ej: 0.85 o 85%)
- `min_soc`: Estado de carga mínimo permitido (ej: 0.1 o 10%)
- `max_soc`: Estado de carga máximo permitido (ej: 1.0 o 100%)

## Requerimientos Técnicos

### 1. Arquitectura AWS

- Función Lambda en Python
- API Gateway para endpoints REST
- Consideraciones de seguridad básicas
- Manejo adecuado de errores y timeouts

### 2. API Endpoints

### POST /optimize

Request:

```json
{
    "battery_params": {
        "capacity_mw": float,
        "duration_hours": float,
        "efficiency": float,
        "min_soc": float,
        "max_soc": float
    },
    "market_params": {
        "zone": string,           // Identificador del nodo/zona
        "start_date": string,     // formato ISO8601: "2024-01-01T00:00:00Z"
        "end_date": string,       // formato ISO8601: "2024-01-31T23:59:59Z"
        "timezone": string        // opcional, ej: "America/Mexico_City"
    }
}
```

Response:

```json
{
    "daily_schedules": [
        {
            "date": string,
            "schedule": [
                {
                    "hour": int,
                    "action": string,  // "charge", "discharge", "idle"
                    "power": float,    // MW, positivo para carga, negativo para descarga
                    "price": float,    // PML en esa hora
                    "soc": float      // Estado de carga resultante (0-1)
                },
                ...  // 24 horas
            ],
            "revenue": float,         // Ingreso neto del día
            "energy_charged": float,  // MWh totales cargados
            "energy_discharged": float, // MWh totales descargados
            "avg_charge_price": float,
            "avg_discharge_price": float
        },
        ...  // Un objeto por cada día
    ],
    "summary": {
        "total_revenue": float,
        "avg_daily_revenue": float,
        "best_day": {
            "date": string,
            "revenue": float
        },
        "worst_day": {
            "date": string,
            "revenue": float
        },
        "total_cycles": float,
        "avg_cycle_revenue": float,
        "avg_arbitrage_spread": float
    }
}

```

### 3. Consideraciones del Algoritmo

### a. Restricciones Técnicas

- Respetar límites de potencia en carga/descarga
- Mantener SOC dentro de límites permitidos
- Aplicar pérdidas por eficiencia en cada ciclo

### b. Lógica de Optimización

- Identificar mejores spreads de precios diarios
- Calcular spread mínimo necesario considerando eficiencia
- Optimizar secuencia de carga/descarga

### c. Manejo de Casos Especiales

- Días con spreads insuficientes
- Períodos con precios negativos
- Validación de datos de entrada
- Días con datos de precios del MEM incompletos

## Entregables

1. **Repositorio GitHub** conteniendo:
   - Código fuente organizado y documentado
   - README completo con:
     - Descripción del proyecto
     - Instrucciones de instalación
     - Documentación de API
     - Ejemplos de uso
     - Decisiones de diseño
   - Requirements.txt o equivalente
2. **API Funcional** desplegada en AWS con:
   - Endpoint documentado
   - Ejemplo de requests/responses
   - Manejo adecuado de errores
3. **Documentación de Diseño** que explique:
   - Estrategia de optimización
   - Manejo de eficiencia
   - Decisiones técnicas clave
   - Potenciales mejoras

## Criterios de Evaluación

### 1. Calidad del Código (40%)

- Claridad y organización
- Prácticas de desarrollo moderno
- Testing comprensivo
- Manejo de errores
- Documentación

### 2. Efectividad del Algoritmo (30%)

- Maximización de ingresos
- Respeto de restricciones técnicas
- Manejo correcto de eficiencia
- Robustez ante diferentes escenarios

### 3. Implementación AWS (20%)

- Arquitectura serverless apropiada
- Seguridad básica
- Performance y escalabilidad
- Documentación de API

### 4. Extras (10%)

- Visualizaciones
- Análisis adicionales
- Optimizaciones avanzadas
- Documentación excepcional

## Tiempo Esperado

- 12-20 horas total (Menos con Claude y herramientas de AI)
- 2 semana de plazo máximo para entrega

## Bonus Points (Opcionales)

1. Visualización de resultados con gráficas
2. Encuentra el nodo y patrón operativo más rentable para un sistema de almacenamiento de energía entre varias zonas de carga para el 2024.

## Recursos Proporcionados

1. API Batu MEM para consulta PMLs
2. Ejemplo básico de request/response
3. Acceso temporal a cuenta AWS
4. Acceso temporal a cuenta de Claude para diseño de la solución. Escríbenos por whatsapp confirmando que quieres resolver el challenge para que te enviemos un link de acceso 🚀

## Tips para el Desarrollo

1. Usar herramientas modernas de desarrollo (Github Copilot, **Cursor**, Claude, etc.)
2. Enfocarse primero en la lógica core antes de la implementación AWS
3. Mantener el código modular y fácil de probar
4. Documentar asunciones y decisiones clave

## Preguntas Frecuentes

1. ¿Puedo usar librerías adicionales?
   - Sí, mientras estén bien documentadas
2. ¿Es necesario implementar todos los bonus points?
   - No, son completamente opcionales
3. ¿Qué pasa si necesito más tiempo?
   - Comunicarlo con anticipación
4. ¿Puedo hacer preguntas durante el desarrollo?
   - Sí, haremos un grupo de whatsapp para que hagas todas las preguntas que quieras
5. ¿Cuánto tiempo tengo para desarrollar el code challenge?
   - Estimamos máximo dos semanas de tiempo para tener noticias tuyas 🙂
6. ¿Para qué lapso de tiempo debo de hacer los análisis?
   - Considera únicamente el año 2024