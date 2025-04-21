# EpiDash – Epidemiological Data Dashboard

<div align="center">

![EpiDash Logo](./assets/img/logo.svg)

**Live Demo:** [https://cema.benfex.net](https://cema.benfex.net)

[![PHP Version](https://img.shields.io/badge/PHP-7.4%2B-blue.svg)](https://www.php.net/)
[![Chart.js](https://img.shields.io/badge/Chart.js-3.9.1-brightgreen.svg)](https://www.chartjs.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.3-green.svg)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**A data visualization dashboard built to empower evidence-based public health decisions**

</div>

---

## 🔍 Overview

**EpiDash** is an interactive web-based dashboard designed to assist epidemiologists, public health researchers, and health officials in visualizing and analyzing epidemiological data across Kenya. Inspired by CEMA's mission to leverage data-driven approaches for infectious disease control, this tool demonstrates the power of digital solutions in modern public health surveillance.

The platform offers intuitive visualization of disease trends across regions, demographics, and time periods, turning complex epidemiological data into actionable insights.

---

## 🎯 Project Objectives

- **Democratize Data Access**: Create an intuitive interface that makes epidemiological data accessible to both experts and policy makers
- **Enhance Analytical Capabilities**: Provide powerful filtering and visualization tools for identifying patterns and trends in disease outbreaks
- **Support Decision Making**: Generate exportable reports and visualizations for evidence-based public health interventions
- **Ensure Scalability**: Architect a solution that can grow from prototype to production, handling increasing data volumes and user demands

---

## 💻 Key Features

| Feature | Description |
|--------|-------------|
| 📊 **Multi-dimensional Visualization** | Interactive charts for disease trends, regional distributions, and demographic analysis powered by Chart.js |
| 🗺️ **Geographic Mapping** | Choropleth maps for visualizing disease prevalence across Kenya's counties using Leaflet.js |
| 🔍 **Advanced Filtering** | Dynamic filters for disease type, region, gender, age group, and custom date ranges |
| 📅 **Temporal Analysis** | Data grouping by day, week, month, quarter, or year for multi-scale trend analysis |
| 📑 **Tabular Data View** | Sortable and searchable data tables with CSV export functionality |
| 📱 **Responsive Design** | Fully functional across desktop and mobile devices with adaptive layouts |
| 🔄 **Dual Data Sources** | Seamless switching between mock data (for demonstration) and database storage (for production) |
| ⚡ **Real-time Metrics** | At-a-glance statistical insights including recovery rates, mortality rates, and trend analysis |

---

## 🛠️ Technology Stack

- **Frontend**:
  - HTML5, CSS3, JavaScript (ES6+)
  - Chart.js for data visualization
  - Leaflet.js for interactive mapping
  - Custom-built responsive UI components

- **Backend**:
  - PHP 7.4+ for server-side processing
  - RESTful API architecture for data retrieval
  - Configurable data sources via environment variables
  - MySQL-compatible database structure

- **DevOps**:
  - Version controlled via Git/GitHub
  - Configured for Apache/Nginx deployments
  - Environment-based configuration management
  - Optimized asset delivery with browser caching

---

## 🔧 Installation & Setup

### Prerequisites

- Web server with PHP 7.4+ support
- MySQL database (optional - mock data is provided for demonstration)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start

1. Clone the repository:
   ```
   git clone https://github.com/dlangkip/epidash.git
   ```

2. Configure the environment:
   - Copy `api/.env.example` to `api/.env`
   - Update settings as needed (database credentials, data source preferences)

3. Deploy to web server:
   - Upload files to your web server or set up in your local development environment
   - Ensure proper permissions for the web server to read/write to required directories

4. Initialize the database (optional for production use):
   - Create a MySQL database
   - Import the schema from `database/epidash.sql`
   - Update database credentials in your `.env` file

5. Access the dashboard:
   ```
   http://your-server-path/epidash/
   ```

---

## 🤝 Alignment with CEMA's Mission

This project was developed as part of my preparation for the **Software Engineering Track at CEMA**, drawing inspiration from the center's focus on data-driven approaches to disease control and public health enhancement across Kenya and Africa.

EpiDash directly supports CEMA's core objectives by:

- **Enhancing Data Accessibility**: Converting complex epidemiological data into intuitive visualizations that inform intervention strategies
- **Supporting Research Translation**: Bridging the gap between data collection and practical application through user-friendly interfaces
- **Promoting Collaborative Analysis**: Creating a platform where multidisciplinary teams can explore the same data through different analytical lenses
- **Enabling Evidence-based Decisions**: Providing public health officials with clear, actionable insights derived from comprehensive data analysis

With guidance from CEMA's expert team, this prototype could evolve into a valuable tool for:
- Disease surveillance and outbreak detection
- Resource allocation optimization for public health initiatives
- Evaluation of intervention effectiveness
- Communication of public health metrics to stakeholders and the general public

---

## 🚀 Development Roadmap

- [ ] **API Integration**: Connect to live epidemiological data sources through secure API endpoints
- [ ] **User Authentication**: Implement role-based access control with secure authentication
- [ ] **Advanced Analytics**: Add predictive modeling and statistical analysis features
- [ ] **Mobile App**: Develop companion mobile application for field data collection
- [ ] **Offline Capability**: Enable offline data access with synchronization
- [ ] **Localization**: Support for multiple languages including Swahili
- [ ] **Real-time Alerts**: Notification system for threshold-based disease monitoring

---

## 📬 Contact

Developed by **Amos Kiprotich Langat**  
📧 dlang@benfex.net  
🔗 [Portfolio](https://dlang.benfex.net) · [GitHub](https://github.com/dlangkip) · [LinkedIn](https://linkedin.com/in/amokip)

---

> *This project currently uses synthetic data modeled on realistic epidemiological patterns. For integration with live data sources or customization inquiries, please reach out via email.*
