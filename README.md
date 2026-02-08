# 💍 LGU Solano Marriage Portal

A modern web application for generating Marriage License Application packs.

---

## 🛠️ Step-by-Step Installation (For Beginners)

Follow these steps exactly to get the portal running on your computer.

### 1. Install Required Software
You need two things installed on your computer:
1.  **Node.js**: [Download here](https://nodejs.org/) (Click the one that says "LTS"). Just click "Next" on everything during installation.
2.  **Python**: [Download here](https://www.python.org/downloads/) (Download the latest version). 
    *   **CRITICAL**: During Python installation, make sure to check the box that says **"Add Python to PATH"**.

### 2. Prepare the Project
1. Clone this repository to your local machine using the following command:
    ```bash
    git clone https://github.com/Danncode10/Marriage-License-System.git
    ```
    *This will create a local copy of the project.*

2. Change into the project directory:
    ```bash
    cd Marriage-License-System/ui
    ```
3. Type the following command and press **Enter**:
    ```bash
    npm run install-all
    ```
    *This will automatically install all the "brains" (libraries) needed for the website and the Excel script.*
1.  Open your **Terminal** (Mac) or **Command Prompt** (Windows).
2.  Type `cd` followed by a space, then drag the project folder into the terminal window and press **Enter**.
3.  Type the following command and press **Enter**:
    ```bash
    npm run install-all
    ```
    *This will automatically install all the "brains" (libraries) needed for the website and the Excel script.*

### 3. Start the Portal
The command `npm run start-portal` is used instead of `npm run dev` to specifically start the production version of the portal, which may include optimizations and configurations that differ from the development environment. This ensures that users are testing the application in a more realistic setting.
After preparing the project, you can start the UI:
1. Open your terminal in the project folder.
2. Type:
    ```bash
    npm run start-portal
    ```
3. Open your browser and go to: `http://localhost:3000`
4. You should see the Marriage License Portal UI.
Every time you want to use the portal:
1.  Open your terminal in the project folder.
2.  Type:
    ```bash
    npm run start-portal
    ```
3.  Open your browser and go to: `http://localhost:3000`

---

## 🗺️ How the Files are Connected (Connection Map)

This project is split into two main parts: the **Website (UI)** and the **Excel Brain (Python)**.

### 1. The Frontend (`/ui`)
*   **Location**: `ui/src/app/marriage/page.tsx`
*   **Role**: This is what the user sees. It collects the names, birthdays, and addresses.
*   **Connection**: When you click "Generate Marriage Pack", it sends all that data to the "API Route".

### 2. The Bridge (`/ui/api/generate-excel`)
*   **Location**: `ui/src/app/api/generate-excel/route.ts`
*   **Role**: It acts as a messenger. It takes the data from the website and "wakes up" the Python script to do the hard work.

### 3. The Excel Brain (`/necessary`)
*   **Location**: `necessary/convert_to_excel.py`
*   **Role**: This is where the magic happens. It knows which cell (like B8 or U12) each piece of data belongs to.
*   **The Template**: `necessary/data/APPLICATION-for-MARRIAGE-LICENSE.xlsx`
    *   *If you want to change how the Excel looks, edit this file.*

---

## 📂 Project Structure Guide

*   **`ui/`**: Contains the code for the website.
    *   `src/app/marriage/`: The form page.
    *   `src/components/ui/`: The buttons, inputs, and cards.
*   **`necessary/`**: Contains the Excel logic.
    *   `convert_to_excel.py`: **Edit this** if you need to change which data goes to which cell.
    *   `data/`: Contains the Excel template and images.

---

## 📝 Common Tasks

### How do I change a cell mapping?
1. Open `necessary/convert_to_excel.py`.
2. Look for lines like `app_sheet['B8'] = to_up(g_first)`.
3. Change `'B8'` to the new cell address you want.

### How do I change the website colors?
1. Open `ui/src/app/globals.css`.
2. Edit the `--primary` (Blue) and `--secondary` (Yellow) hex codes.
