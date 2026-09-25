# Motus Report — Draft 1

Authors:
CJ Mayhew
Owen Hancock
Bill Stanton
Kendall Coddington

Date: 9/23/2026

---

## Introduction

Many operational databases used in industry are current state databases that only store what the data looks like at this very moment, and do not keep track of any changes to the data. This makes it difficult or impossible to make historical observations about the data being stored.

Motus aims to eliminate that problem by periodically taking snapshots of the database and comparing snapshots over time. Through these comparisons, insights and trends can be discovered that can inform adjustments in procedure for the company or institution using the app.

The use case that inspired the application is Grove City College's student database, which has the exact problems explained above. However, this app is intended to be used by any company, business, or institution with a current state database.

Users can add new databases to their app using the connection string for the database. When adding a new database, users can select which tables and columns they want to be tracked. Once the app is connected to a database and configured, it will automatically take snapshots and analyze the changes that occurred. The app displays relevant statistics and visuals to help users understand what has changed. Users can select how often snapshots are taken, and which snapshots are included when computing statistics.

---

## Representative Tasks

The following representative tasks describe common goals that users may desire to accomplish through the app. These tasks focus on what users would like to accomplish rather than specific interface actions, allowing the system to be designed and evaluated around realistic user needs.

### Task 1 – Add a New Database (MVP)

Dr. Wolfe logs onto the app to add the colleges' student database to his tracked databases. He enters the connection string for the database and connects. He decides which tables and columns he cares about and sets the snapshot frequency to one month. He logs off while the app completes its automated analysis.

### Task 2 – Checking Computer Science Retention Rates (MVP)

Dr. Wolfe opens the app and goes to check the Grove City College student database. He finds that 80% of students who started in computer science 4 years ago have switched majors. He also finds that 50% of those students switched to Business Analytics. He takes note of these stats so he can mention them in the next department meeting.

### Task 3 – Graph Generation (MVP)

Dr. Wolfe clicks the "Graphs" tab in the app, where he can choose which graph to generate. He generates a graph that shows "CS Retention Rate Year Over Year". He sees that the CS Retention Rate had slowly decreased each year since 2020 until it spiked in 2025. The CS Department Professors hypothesize as to why the retention rate recently spiked.

### Task 4 – Downloading a PDF

Dr. Wolfe wants to use these findings in a formal presentation to the Dean, asking for an increase in funding for the CS Department. He selects the data, summary statistics, and graphs that he wants for the presentation. He exports his selected information and exports it as PDFs. He uses the PDFs in the presentation, where he convinces the Dean to increase the budget by 15%.

### Task 5 – Searching for a Previous Database Snapshot

Dr. Wolfe wants to access the Grove City College student database as it existed during the Fall 2024 semester. He goes to the snapshot history and searches for all the snapshots from Fall 2024. He reviews the historical student records before performing a new analysis.

### Task 6 – Change Snapshot Frequency

Dr. Wolfe wants the application to capture database snapshots more frequently so that he has more historical data available for analysis. The current snapshot frequency is once per month, but he determines that a weekly snapshot would provide the additional data points he needs. He changes the snapshot frequency from one month to one week.

### Task 7 – Trigger a Manual Snapshot of the Database
Dr. Wolfe is aware that 10 students are about to transfer into the GCC Computer Science department from other schools. He wants to preserve the current state of the student database as a historical snapshot before the new students are added. He triggers a manual snapshot so that the current database can be retrieved and reviewed later.

### Task 8 – Add and Remove Additional Databases

Dr. Wolfe is coordinating a study with multiple colleges. He adds the student databases from the participating colleges to the application so that he can track and analyze their data. Later, one of the colleges leaves the study, so Dr. Wolfe removes its database from the application while retaining the historical snapshots that have already been collected.

---

## Related Work

### Metabase

Connects to your existing database and auto-generates dashboards, stats, and visualizations without you writing queries. Our app can likewise generate such dashboard and stats, but the key difference are those historical snapshots. Metabase does not track how the data changes over time, which is the core of our app. Our target audience needs those historical snapshots, or else they will simply have their database with some useful summary statistics and visualizations. Metabase alone cannot tackle the problem.

### Datomic

A database built from scratch to never change old data. Every fact gets a timestamp and nothing is ever overwritten, so you can look up any past moment directly. Our app has that same goal of keeping history so you can look back at it. But Datomic makes you build a whole new database around this idea, while our app adds history on top of a normal database you already have. Our users already have a working database and cannot just swap it out for a new one. Looking at Datomic showed us that "never overwrite, always add a timestamp" is the right way to think about history. We just need to do that without asking users to change their whole database.

### Fivetran

A tool that copies data from a database into a warehouse using change data capture (CDC), so it only grabs what changed. Our app also needs to notice changes on its own, without the source database needing any special setup. The difference is what happens next. Fivetran just moves the changed data somewhere else for later use, but it does not let you ask "what did this look like last Tuesday?" Our app uses that same kind of change detection to build snapshots you can look back at right where the data already lives, since our users want to check the past directly, not run a separate warehouse and pipeline. Fivetran showed us that our way of detecting changes is solid, but also that detecting changes alone is not enough. We still have to add the "look back in time" part ourselves.

### Snowflake Time Travel

A built in feature of Snowflake that lets you look at a table the way it was at some point in the past, even though the live table only shows what is there right now. This is the closest match to what our app does. Both let you see old versions of data that would otherwise only show "now." The big difference is that Time Travel only works if your data is already in Snowflake, while our app needs to give that same "look at the past" ability to whatever database our users already have, without making them switch. This matters because our users are people who already have a database and do not want to move it. Looking at Time Travel showed us that adding history on top of a normal, current only system is a solid idea, and it helped us think about how long to keep old data and how users should ask for it.

---

## Bibliography

"AT | BEFORE." *Snowflake Documentation*, Snowflake Inc., docs.snowflake.com/en/sql-reference/constructs/at-before. Accessed 24 Sept. 2026.

"Change Data Capture: An Increasingly Critical Mechanism for Organizations." *Fivetran Blog*, Fivetran, www.fivetran.com/blog/change-data-capture-an-increasingly-critical-mechanism-for-organisations. Accessed 24 Sept. 2026.

"History." *Datomic Client Tutorial*, Nubank, docs.datomic.com/client-tutorial/history.html. Accessed 24 Sept. 2026.

"SQL Server | Connector Overview." *Fivetran Documentation*, Fivetran, fivetran.com/docs/connectors/databases/sql-server. Accessed 24 Sept. 2026.

"Transaction Model." *Datomic Documentation*, Nubank, docs.datomic.com/transactions/model.html. Accessed 24 Sept. 2026.

"Understanding & Using Time Travel." *Snowflake Documentation*, Snowflake Inc., docs.snowflake.com/en/user-guide/data-time-travel. Accessed 24 Sept. 2026.

"Visual SQL Query Builder." *Metabase*, Metabase, www.metabase.com/features/query-builder. Accessed 24 Sept. 2026.

"X-Rays." *Metabase Documentation*, Metabase, www.metabase.com/docs/latest/exploration-and-organization/x-rays. Accessed 24 Sept. 2026.
