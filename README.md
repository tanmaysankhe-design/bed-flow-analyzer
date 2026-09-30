# Hospital Capacity Insights

Build a simple but complete BE Computer Engineering BDA (Big Data Analytics) mini-project named "Hospital Resource Utilization Analytics". Keep it intentionally simple and demonstrative, not a complicated production system.

Goal/problem: help a hospital identify how resources (beds, ICU beds, staff, equipment) are being utilized and predict near-term bed demand so administrators can plan capacity.

Required BDA algorithms: exactly these 2, clearly implemented and explained:
1) K-Means Clustering — cluster hospital departments/months into utilization groups such as Low, Moderate, High based on bed occupancy, patient count, average length of stay, and staff utilization. Show cluster labels and a simple explanation.
2) Linear Regression — predict next-period occupied beds from historical patient/occupancy trend. Show prediction, basic error metric (MAE or R²) if available, and formula/feature explanation.

Technology requirements:
- Python: primary analytics implementation using pandas, numpy, scikit-learn. Include a runnable Python script/notebook-style file that loads a CSV dataset, cleans/transforms it, runs K-Means and Linear Regression, and exports analysis_results.csv plus a Power BI-ready CSV.
- Java: simple companion component, not a second analytics implementation. Create a small Java CLI/service that reads the exported results CSV and prints a summary/report (total records, average occupancy, high-utilization count, predicted beds). Keep Java dependency-light and easy to run.
- Power BI: the web app should not try to embed Power BI or require paid APIs. Instead provide a clearly documented Power BI-ready CSV export and exact steps/fields to create a dashboard in Power BI Desktop. Add an in-app "Power BI Guide" section describing recommended visuals: KPI cards, occupancy by department, cluster distribution, actual vs predicted beds, monthly trend.
- The website itself should have a clean dashboard preview of the BDA results for demonstration, but explicitly label it as "Dashboard Preview" and "Power BI-ready export".

Dataset:
Generate a realistic synthetic dataset with about 150-300 rows covering 5 departments (Emergency, General Medicine, Surgery, ICU, Pediatrics) over monthly periods for 24-36 months. Fields should include date/month, department, total_beds, occupied_beds, admissions, avg_length_of_stay, staff_on_duty, equipment_utilization_pct. Add realistic variation and enough signal for clustering/regression.
Do NOT use external paid APIs or services.

App pages/sections:
- Overview: problem statement, objectives, technology stack, the 2 BDA algorithms, simple architecture/workflow.
- Data Explorer: table with filters for department/month and a CSV download button.
- BDA Analysis: K-Means results with cluster cards/table and a utilization scatter/bar chart; Linear Regression actual-vs-predicted chart and prediction summary.
- Dashboard Preview: polished Power BI-style charts and KPI cards using the exported results.
- Power BI Guide: exact import/export instructions and suggested visuals/fields.
- Run Project: simple instructions for Python and Java, including commands. Show project folder structure.

Important constraints:
- No authentication, no payments, no unnecessary backend complexity.
- Make UI modern, clean, academic/demo friendly, responsive.
- Use realistic labels and explain that data is synthetic for academic demonstration.
- Include downloadable CSV files and source-code snippets/files in the project repository.
- Make the analytics clearly traceable: raw data -> preprocessing -> K-Means -> regression -> exported results -> Power BI.
- Do not add extra algorithms beyond K-Means and Linear Regression.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bed-flow-analyzer.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d4ae3373-e83e-46ff-934f-f15229a1fe52).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
