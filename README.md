

1.	A hospital provides a patient records dataset containing missing values, duplicate entries, inconsistent formats, and mixed data types across age, blood pressure, glucose level, and diagnosis columns. Write a Python program to assess data quality issues, clean the dataset, normalize numerical features, and engineer a new risk-score feature to prepare it for machine learning.
Code:

# Step 1: Import Required Libraries
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

# Step 2: Load Dataset
# Make sure hospital_data.csv is in the same folder as this notebook
df = pd.read_csv("hospital_data.csv")

# Step 3: Display Original Dataset
print("========== ORIGINAL DATASET ==========\n")
print(df)

# Dataset Information
print("\n========== DATASET INFORMATION ==========\n")
print(df.info())

# Statistical Summary
print("\n========== STATISTICAL SUMMARY ==========\n")
print(df.describe(include='all'))



print("\n========== DATA QUALITY ASSESSMENT ==========\n")

# Missing Values
print("Missing Values:")
print(df.isnull().sum())

# Duplicate Records
print("\nDuplicate Records:")
print(df.duplicated().sum())

# Data Types
print("\nData Types:")
print(df.dtypes)

# Unique Diagnosis Values
print("\nUnique Diagnosis Values:")
print(df["Diagnosis"].unique())


print("\n========== DATA CLEANING ==========\n")

# Remove duplicate rows
df = df.drop_duplicates()

# Remove extra spaces from column names
df.columns = df.columns.str.strip()

# Remove leading/trailing spaces from text columns
for col in df.select_dtypes(include='object'):
    df[col] = df[col].str.strip()

# Convert columns to numeric
df["Age"] = pd.to_numeric(df["Age"], errors='coerce')
df["BloodPressure"] = pd.to_numeric(df["BloodPressure"], errors='coerce')
df["GlucoseLevel"] = pd.to_numeric(df["GlucoseLevel"], errors='coerce')

# Standardize Diagnosis values
df["Diagnosis"] = df["Diagnosis"].str.upper()

# Fill missing numerical values with mean
df["Age"] = df["Age"].fillna(df["Age"].mean())
df["BloodPressure"] = df["BloodPressure"].fillna(df["BloodPressure"].mean())
df["GlucoseLevel"] = df["GlucoseLevel"].fillna(df["GlucoseLevel"].mean())

# Fill missing Diagnosis with mode
df["Diagnosis"] = df["Diagnosis"].fillna(df["Diagnosis"].mode()[0])

print("Cleaned Dataset:\n")
print(df)


print("\n========== NORMALIZATION ==========\n")

scaler = StandardScaler()

df[["Age", "BloodPressure", "GlucoseLevel"]] = scaler.fit_transform(
    df[["Age", "BloodPressure", "GlucoseLevel"]]
)

print(df[["Age", "BloodPressure", "GlucoseLevel"]])



print("\n========== FEATURE ENGINEERING ==========\n")

# Create Risk Score
df["RiskScore"] = (
    0.30 * df["Age"] +
    0.35 * df["BloodPressure"] +
    0.35 * df["GlucoseLevel"]
)

print(df[["Age", "BloodPressure", "GlucoseLevel", "RiskScore"]])



print("\n========== FINAL DATASET ==========\n")
print(df)

print("\n========== FINAL DATASET INFORMATION ==========\n")
print(df.info())

print("\n========== MISSING VALUES AFTER CLEANING ==========\n")
print(df.isnull().sum())



df.to_csv("hospital_cleaned_dataset.csv", index=False)

print("\nCleaned dataset saved successfully as 'hospital_cleaned_dataset.csv'")


2.	Implement a Python program using Pandas, NumPy, and Scikit-learn to perform the following on a medical dataset:
(i) Assess data quality — identify missing values, duplicates, and outliers 
(ii) Apply data cleaning — imputation, duplicate removal, outlier treatment 
(iii) Normalize numerical columns using Min-Max and Standard scaling 
(iv)Engineer new features (BMI category, age group, risk score) and display final dataset.
Code :

# ==========================================================
# Experiment 2
# Aim: Data Quality Assessment, Cleaning,
# Normalization and Feature Engineering
# ==========================================================

# Step 1: Import Libraries
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, StandardScaler

# Step 2: Load Dataset
df = pd.read_csv("medical_dataset.csv")

print("========== ORIGINAL DATASET ==========\n")
print(df)

# ==========================================================
# (i) DATA QUALITY ASSESSMENT
# ==========================================================

print("\n========== DATA QUALITY ASSESSMENT ==========\n")

# Dataset Information
print("Dataset Information")
print(df.info())

# Missing Values
print("\nMissing Values")
print(df.isnull().sum())

# Duplicate Records
print("\nDuplicate Records:", df.duplicated().sum())

# ==========================================================
# Detect Outliers using IQR Method
# ==========================================================

print("\n========== OUTLIER DETECTION ==========\n")

numeric_cols = ["Age", "Height", "Weight", "BloodPressure", "Glucose"]

for col in numeric_cols:
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1

    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR

    outliers = df[(df[col] < lower) | (df[col] > upper)]

    print(f"\n{col}")
    print("Number of Outliers:", len(outliers))

# ==========================================================
# (ii) DATA CLEANING
# ==========================================================

print("\n========== DATA CLEANING ==========\n")

# Remove duplicate rows
df = df.drop_duplicates()

# Fill missing values with mean
for col in numeric_cols:
    df[col] = df[col].fillna(df[col].mean())

# Outlier Treatment using IQR Capping
for col in numeric_cols:

    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)

    IQR = Q3 - Q1

    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR

    df[col] = np.where(df[col] < lower, lower, df[col])
    df[col] = np.where(df[col] > upper, upper, df[col])

print(df)

# ==========================================================
# (iii) NORMALIZATION
# ==========================================================

print("\n========== MIN-MAX SCALING ==========\n")

minmax = MinMaxScaler()

df_minmax = df.copy()

df_minmax[numeric_cols] = minmax.fit_transform(df[numeric_cols])

print(df_minmax[numeric_cols])

print("\n========== STANDARD SCALING ==========\n")

standard = StandardScaler()

df_standard = df.copy()

df_standard[numeric_cols] = standard.fit_transform(df[numeric_cols])

print(df_standard[numeric_cols])

# ==========================================================
# (iv) FEATURE ENGINEERING
# ==========================================================

print("\n========== FEATURE ENGINEERING ==========\n")

# BMI Calculation
df["BMI"] = df["Weight"] / ((df["Height"] / 100) ** 2)

# BMI Category
def bmi_category(bmi):

    if bmi < 18.5:
        return "Underweight"

    elif bmi < 25:
        return "Normal"

    elif bmi < 30:
        return "Overweight"

    else:
        return "Obese"

df["BMI_Category"] = df["BMI"].apply(bmi_category)

# Age Group
def age_group(age):

    if age < 18:
        return "Child"

    elif age < 40:
        return "Adult"

    elif age < 60:
        return "Middle Age"

    else:
        return "Senior"

df["Age_Group"] = df["Age"].apply(age_group)

# Risk Score
df["Risk_Score"] = (
      0.30 * df["Age"]
    + 0.35 * df["BloodPressure"]
    + 0.35 * df["Glucose"]
)

# ==========================================================
# Final Dataset
# ==========================================================

print("\n========== FINAL DATASET ==========\n")

print(df)

print("\nFinal Dataset Information\n")
print(df.info())

# Save Final Dataset
df.to_csv("medical_dataset_cleaned.csv", index=False)

print("\nDataset saved as medical_dataset_cleaned.csv")



3.	Using the Titanic dataset (CSV) and a supplementary passenger metadata file (JSON), write a Python program to: load and inspect both datasets, resolve schema differences, apply label encoding on categorical fields, normalize numerical columns using StandardScaler, and merge them into a single analysis-ready DataFrame. Display before and after statistics.
code:

# ==========================================================
# Experiment 3
# Aim: Data Transformation and Data Integration
# ==========================================================

# Step 1: Import Required Libraries

import pandas as pd
import numpy as np

from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler

# ==========================================================
# Step 2: Load Datasets
# ==========================================================

titanic = pd.read_csv("titanic.csv")

metadata = pd.read_json("passenger_metadata.json")

print("========== TITANIC DATASET ==========\n")
print(titanic.head())

print("\n========== METADATA DATASET ==========\n")
print(metadata.head())

# ==========================================================
# Step 3: Inspect Datasets
# ==========================================================

print("\n========== TITANIC INFORMATION ==========\n")
print(titanic.info())

print("\n========== METADATA INFORMATION ==========\n")
print(metadata.info())

print("\n========== TITANIC STATISTICS (BEFORE) ==========\n")
print(titanic.describe(include='all'))

print("\n========== METADATA STATISTICS ==========\n")
print(metadata.describe(include='all'))

# ==========================================================
# Step 4: Resolve Schema Differences
# ==========================================================

print("\n========== RESOLVING SCHEMA DIFFERENCES ==========\n")

# Display column names
print("Titanic Columns:")
print(titanic.columns)

print("\nMetadata Columns:")
print(metadata.columns)

# Example:
# Rename Passenger_ID in JSON to PassengerId

if "Passenger_ID" in metadata.columns:
    metadata.rename(columns={"Passenger_ID":"PassengerId"}, inplace=True)

# Convert ID columns to same datatype

titanic["PassengerId"] = titanic["PassengerId"].astype(int)
metadata["PassengerId"] = metadata["PassengerId"].astype(int)

print("\nSchema Updated Successfully")

# ==========================================================
# Step 5: Label Encoding
# ==========================================================

print("\n========== LABEL ENCODING ==========\n")

encoder = LabelEncoder()

categorical_columns = []

for col in titanic.columns:

    if titanic[col].dtype == 'object':

        categorical_columns.append(col)

for col in categorical_columns:

    titanic[col] = titanic[col].astype(str)

    titanic[col] = encoder.fit_transform(titanic[col])

print("Encoded Columns:")
print(categorical_columns)

# ==========================================================
# Step 6: Standard Scaling
# ==========================================================

print("\n========== STANDARD SCALING ==========\n")

scaler = StandardScaler()

numeric_columns = titanic.select_dtypes(include=np.number).columns

numeric_columns = numeric_columns.drop("PassengerId")

titanic[numeric_columns] = scaler.fit_transform(titanic[numeric_columns])

print(titanic[numeric_columns].head())

# ==========================================================
# Step 7: Merge Datasets
# ==========================================================

print("\n========== MERGING DATASETS ==========\n")

merged_df = pd.merge(

    titanic,

    metadata,

    on="PassengerId",

    how="left"

)

# ==========================================================
# Step 8: Display Final Dataset
# ==========================================================

print("\n========== MERGED DATASET ==========\n")

print(merged_df.head())

print("\nMerged Dataset Shape")
print(merged_df.shape)

# ==========================================================
# Step 9: Statistics After Transformation
# ==========================================================

print("\n========== STATISTICS AFTER TRANSFORMATION ==========\n")

print(merged_df.describe(include='all'))

print("\n========== FINAL DATASET INFORMATION ==========\n")

print(merged_df.info())

# ==========================================================
# Step 10: Save Final Dataset
# ==========================================================

merged_df.to_csv("Titanic_Analysis_Ready.csv", index=False)

print("\nAnalysis-ready dataset saved as Titanic_Analysis_Ready.csv")

4.	A data analyst receives sales data in CSV format and customer data in JSON format from two different departments. Write a Python program to integrate both datasets, apply necessary transformations (handling missing values, type conversion, normalization), and produce a unified dataset ready for analysis.
Code:
# ==========================================================
# Experiment 4
# Aim: Data Integration and Data Transformation
# ==========================================================

# Step 1: Import Required Libraries

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

# ==========================================================
# Step 2: Load Datasets
# ==========================================================

sales = pd.read_csv("sales_data.csv")

customers = pd.read_json("customer_data.json")

print("========== SALES DATA ==========\n")
print(sales.head())

print("\n========== CUSTOMER DATA ==========\n")
print(customers.head())

# ==========================================================
# Step 3: Inspect Datasets
# ==========================================================

print("\n========== SALES DATA INFORMATION ==========\n")
print(sales.info())

print("\n========== CUSTOMER DATA INFORMATION ==========\n")
print(customers.info())

print("\n========== SALES DATA STATISTICS ==========\n")
print(sales.describe(include='all'))

print("\n========== CUSTOMER DATA STATISTICS ==========\n")
print(customers.describe(include='all'))

# ==========================================================
# Step 4: Handle Missing Values
# ==========================================================

print("\n========== HANDLING MISSING VALUES ==========\n")

# Fill missing numeric values with mean
numeric_cols = sales.select_dtypes(include=np.number).columns

for col in numeric_cols:
    sales[col] = sales[col].fillna(sales[col].mean())

# Fill missing categorical values with mode
categorical_cols = sales.select_dtypes(include='object').columns

for col in categorical_cols:
    sales[col] = sales[col].fillna(sales[col].mode()[0])

# Customer dataset

numeric_cols2 = customers.select_dtypes(include=np.number).columns

for col in numeric_cols2:
    customers[col] = customers[col].fillna(customers[col].mean())

categorical_cols2 = customers.select_dtypes(include='object').columns

for col in categorical_cols2:
    customers[col] = customers[col].fillna(customers[col].mode()[0])

print("Missing values handled successfully.")

# ==========================================================
# Step 5: Data Type Conversion
# ==========================================================

print("\n========== DATA TYPE CONVERSION ==========\n")

sales["CustomerID"] = sales["CustomerID"].astype(int)
customers["CustomerID"] = customers["CustomerID"].astype(int)

print("CustomerID datatype in Sales:", sales["CustomerID"].dtype)
print("CustomerID datatype in Customer:", customers["CustomerID"].dtype)

# ==========================================================
# Step 6: Normalize Numerical Columns
# ==========================================================

print("\n========== NORMALIZATION ==========\n")

scaler = StandardScaler()

sales_numeric = sales.select_dtypes(include=np.number).columns

sales_numeric = sales_numeric.drop("CustomerID")

sales[sales_numeric] = scaler.fit_transform(sales[sales_numeric])

print(sales[sales_numeric].head())

# ==========================================================
# Step 7: Merge Both Datasets
# ==========================================================

print("\n========== MERGING DATASETS ==========\n")

merged_df = pd.merge(

    sales,

    customers,

    on="CustomerID",

    how="inner"

)

# ==========================================================
# Step 8: Display Final Dataset
# ==========================================================

print("\n========== UNIFIED DATASET ==========\n")

print(merged_df.head())

print("\nDataset Shape:")
print(merged_df.shape)

print("\nDataset Information")
print(merged_df.info())

print("\nDataset Statistics")
print(merged_df.describe(include='all'))

# ==========================================================
# Step 9: Save Final Dataset
# ==========================================================

merged_df.to_csv("Unified_Sales_Customer_Data.csv", index=False)

print("\nUnified dataset saved as 'Unified_Sales_Customer_Data.csv'")



5.	Write the program for apply data transformation process of converting data into a suitable format for analysis. Data integration combines data from different sources into a unified dataset. The Pandas library provides functions such as rename() and merge() to perform these operations efficiently.

Code:

# ==========================================================
# Experiment 5
# Aim: Data Transformation and Data Integration
# ==========================================================

# Step 1: Import Required Libraries

import pandas as pd
import numpy as np

# ==========================================================
# Step 2: Load Datasets
# ==========================================================

employees = pd.read_csv("employee_data.csv")

departments = pd.read_csv("department_data.csv")

print("========== EMPLOYEE DATA ==========\n")
print(employees)

print("\n========== DEPARTMENT DATA ==========\n")
print(departments)

# ==========================================================
# Step 3: Inspect Datasets
# ==========================================================

print("\n========== EMPLOYEE INFORMATION ==========\n")
print(employees.info())

print("\n========== DEPARTMENT INFORMATION ==========\n")
print(departments.info())

# ==========================================================
# Step 4: Data Transformation
# ==========================================================

print("\n========== DATA TRANSFORMATION ==========\n")

# Rename Columns

employees.rename(columns={
    "Emp_ID": "EmployeeID",
    "Emp_Name": "EmployeeName"
}, inplace=True)

departments.rename(columns={
    "Dept_ID": "DepartmentID",
    "Dept_Name": "DepartmentName"
}, inplace=True)

print("Columns renamed successfully.\n")

print(employees.head())

print(departments.head())

# ==========================================================
# Handle Missing Values
# ==========================================================

employees["Salary"] = employees["Salary"].fillna(employees["Salary"].mean())

employees["DepartmentID"] = employees["DepartmentID"].fillna(
    employees["DepartmentID"].mode()[0]
)

# ==========================================================
# Data Type Conversion
# ==========================================================

employees["EmployeeID"] = employees["EmployeeID"].astype(int)

employees["DepartmentID"] = employees["DepartmentID"].astype(int)

departments["DepartmentID"] = departments["DepartmentID"].astype(int)

print("\nData types converted successfully.")

# ==========================================================
# Data Integration using Merge
# ==========================================================

print("\n========== DATA INTEGRATION ==========\n")

merged_df = pd.merge(

    employees,

    departments,

    on="DepartmentID",

    how="inner"

)

print(merged_df)

# ==========================================================
# Final Dataset Information
# ==========================================================

print("\n========== FINAL DATASET ==========\n")

print(merged_df.info())

print("\nStatistical Summary")

print(merged_df.describe(include='all'))

# ==========================================================
# Save Final Dataset
# ==========================================================

merged_df.to_csv("Integrated_Employee_Data.csv", index=False)

print("\nIntegrated dataset saved as 'Integrated_Employee_Data.csv'")


6.	Write the program to simulate a real-time data stream that generates random temperature sensor readings (between 15°C and 110°C) every 0.3 seconds using a generator function. As each reading arrives, compute and display: current value, running mean, running minimum, running maximum, and total count. Stop after 15 readings.
Code:
# ==========================================================
# Experiment 6
# Aim: Simulate Real-Time Temperature Data Stream
# ==========================================================

# Step 1: Import Required Libraries

import random
import time

# ==========================================================
# Step 2: Generator Function
# ==========================================================

def temperature_stream():

    while True:
        yield round(random.uniform(15, 110), 2)

# ==========================================================
# Step 3: Initialize Variables
# ==========================================================

stream = temperature_stream()

count = 0
total = 0
minimum = float('inf')
maximum = float('-inf')

print("===============================================")
print(" Real-Time Temperature Sensor Data Stream")
print("===============================================\n")

print("{:<8} {:<15} {:<15} {:<15} {:<15} {:<10}".format(
    "Count",
    "Current(°C)",
    "Mean(°C)",
    "Minimum(°C)",
    "Maximum(°C)",
    "Readings"
))

print("-"*85)

# ==========================================================
# Step 4: Process 15 Readings
# ==========================================================

for i in range(15):

    temp = next(stream)

    count += 1

    total += temp

    mean = total / count

    if temp < minimum:
        minimum = temp

    if temp > maximum:
        maximum = temp

    print("{:<8} {:<15.2f} {:<15.2f} {:<15.2f} {:<15.2f} {:<10}".format(
        count,
        temp,
        mean,
        minimum,
        maximum,
        count
    ))

    time.sleep(0.3)

print("\n===============================================")
print(" Data Stream Completed Successfully")
print("===============================================")





7.	 Write a PySpark program using DataFrames to filter employees with salary>70,000 and group by department to find average salary  and find the maximum salary wise from CSV file and perform visual data analysis –Plot bar chart and Histogram of salary distribution using Matplotlib
Code:

# ==========================================================
# Experiment 7
# Aim: PySpark DataFrame Operations and Visualization
# ==========================================================

# Step 1: Import Libraries

from pyspark.sql import SparkSession
from pyspark.sql.functions import avg, max
import matplotlib.pyplot as plt

# ==========================================================
# Step 2: Create Spark Session
# ==========================================================

spark = SparkSession.builder \
    .appName("Employee Analysis") \
    .getOrCreate()

# ==========================================================
# Step 3: Load CSV File
# ==========================================================

df = spark.read.csv(
    "employee.csv",
    header=True,
    inferSchema=True
)

print("========== EMPLOYEE DATA ==========")

df.show()

# ==========================================================
# Step 4: Display Schema
# ==========================================================

print("========== DATA TYPES ==========")

df.printSchema()

# ==========================================================
# Step 5: Filter Employees
# Salary > 70000
# ==========================================================

print("========== EMPLOYEES WITH SALARY > 70000 ==========")

high_salary = df.filter(df.Salary > 70000)

high_salary.show()

# ==========================================================
# Step 6: Average Salary Department-wise
# ==========================================================

print("========== AVERAGE SALARY ==========")

avg_salary = df.groupBy("Department").agg(
    avg("Salary").alias("AverageSalary")
)

avg_salary.show()

# ==========================================================
# Step 7: Maximum Salary Department-wise
# ==========================================================

print("========== MAXIMUM SALARY ==========")

max_salary = df.groupBy("Department").agg(
    max("Salary").alias("MaximumSalary")
)

max_salary.show()

# ==========================================================
# Step 8: Convert Spark DataFrame to Pandas
# ==========================================================

avg_pd = avg_salary.toPandas()

salary_pd = df.toPandas()

# ==========================================================
# Step 9: Bar Chart
# ==========================================================

plt.figure(figsize=(8,5))

plt.bar(
    avg_pd["Department"],
    avg_pd["AverageSalary"]
)

plt.title("Average Salary by Department")

plt.xlabel("Department")

plt.ylabel("Average Salary")

plt.grid(True)

plt.show()

# ==========================================================
# Step 10: Histogram
# ==========================================================

plt.figure(figsize=(8,5))

plt.hist(
    salary_pd["Salary"],
    bins=8
)

plt.title("Salary Distribution")

plt.xlabel("Salary")

plt.ylabel("Frequency")

plt.grid(True)

plt.show()

# ==========================================================
# Step 11: Stop Spark Session
# ==========================================================

spark.stop()

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

1]import pandas as pd
from sklearn.preprocessing import MinMaxScaler
df = pd.DataFrame({
    "Age":[25,35,None,45,35],
    "BloodPressure":[120,130,140,None,130],
    "Glucose":[90,110,150,160,110],
    "Diagnosis":["Diabetes","diabetes","Healthy","Healthy","diabetes"]
})
print("Missing Values")
print(df.isnull().sum())
print("Duplicate Records")
print(df.duplicated().sum())
df["Age"] = df["Age"].fillna(df["Age"].mean())
df["BloodPressure"] = df["BloodPressure"].fillna(df["BloodPressure"].mean())
df = df.drop_duplicates()
df["Diagnosis"] = df["Diagnosis"].str.lower()
scaler = MinMaxScaler()
df[["Age","BloodPressure","Glucose"]] = scaler.fit_transform(
    df[["Age","BloodPressure","Glucose"]]
)
df["RiskScore"] = df["Age"] + df["BloodPressure"] + df["Glucose"]
print(df)


2]import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, StandardScaler
df = pd.DataFrame({
    "Age":[25,35,np.nan,45,60],
    "BMI":[18,24,30,35,28],
    "BP":[120,130,140,200,150],
    "Glucose":[90,110,150,300,180]})
print("Missing Values")
print(df.isnull().sum())
print("Duplicate Records")
print(df.duplicated().sum())
print("Before Cleaning")
print(df.describe())
df = df.fillna(df.mean())
df = df.drop_duplicates()
# Outlier Treatment
df["BP"] = np.where(df["BP"]>180, df["BP"].median(), df["BP"])
df["Glucose"] = np.where(df["Glucose"]>250, df["Glucose"].median(), df["Glucose"])
df[["Age","BMI"]] = MinMaxScaler().fit_transform(df[["Age","BMI"]])
df[["BP","Glucose"]] = StandardScaler().fit_transform(df[["BP","Glucose"]])
df["BMI_Category"] = ["Normal","Normal","Obese","Obese","Overweight"]
df["Age_Group"] = ["Young","Adult","Adult","Adult","Senior"]
df["RiskScore"] = df["Age"] + df["BMI"] + df["BP"] + df["Glucose"]
print("Final Dataset")
3]import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
titanic = pd.DataFrame({
    "PassengerId":[1,2,3],
    "Name":["John","Mary","David"],
    "Sex":["Male","Female","Male"],
    "Age":[22,35,28],
    "Fare":[100,200,150]})
metadata = pd.DataFrame({
    "Passenger_ID":[1,2,3],
    "Cabin":["C1","C2","C3"]
})
print("Before Statistics")
print(titanic.describe())
metadata.rename(columns={"Passenger_ID":"PassengerId"}, inplace=True)
df = pd.merge(titanic, metadata, on="PassengerId")
encoder = LabelEncoder()
df["Sex"] = encoder.fit_transform(df["Sex"])
scaler = StandardScaler()
df[["Age","Fare"]] = scaler.fit_transform(df[["Age","Fare"]])
print("\nFinal Dataset")
print(df)
print("\nAfter Statistics")
print(df.describe())

4] import pandas as pd
from sklearn.preprocessing import MinMaxScaler
sales = pd.DataFrame({
    "CustomerID":[101,102,103],
    "Amount":[5000,None,7000]
})
customer = pd.DataFrame({
    "CustomerID":[101,102,103],
    "Name":["Rahul","Sneha","Arjun"],
    "Age":[25,30,28]
})
df = pd.merge(sales, customer, on="CustomerID")
df["Amount"] = df["Amount"].fillna(df["Amount"].mean())
df["Age"] = df["Age"].astype(int)
scaler = MinMaxScaler()
df[["Amount","Age"]] = scaler.fit_transform(df[["Amount","Age"]])
print(df)








5] import pandas as pd
emp = pd.DataFrame({
    "Emp_ID":[101,102,103],
    "Name":["Rahul","Sneha","Arjun"]
})
dept = pd.DataFrame({
    "Employee_ID":[101,102,103],
    "Department":["HR","IT","Finance"]
})
dept.rename(columns={"Employee_ID":"Emp_ID"}, inplace=True)
df = pd.merge(emp, dept, on="Emp_ID")
print(df)













6] import random
import time
def temperature():
    for i in range(15):
        yield random.randint(15,110)
        time.sleep(0.3)
total = 0
count = 0
minimum = 110
maximum = 15
for temp in temperature():
    count += 1
    total += temp
    minimum = min(minimum,temp)
    maximum = max(maximum,temp)
    mean = total/count
    print("Current :",temp)
    print("Running Mean :",mean)
    print("Running Minimum :",minimum)
    print("Running Maximum :",maximum)
    print("Count :",count)
    print()



8] from pyspark.sql import SparkSession
import matplotlib.pyplot as plt
spark = SparkSession.builder.appName("Employee").getOrCreate()
df = spark.read.csv(
    "employee.csv",
    header=True,
    inferSchema=True
)
print("Employees with Salary > 70000")
df.filter(df.Salary > 70000).show()
print("Average Salary by Department")
df.groupBy("Department").avg("Salary").show()
print("Maximum Salary by Department")
df.groupBy("Department").max("Salary").show()
pdf = df.toPandas()
plt.bar(pdf["Name"], pdf["Salary"])
plt.title("Employee Salary")
plt.xlabel("Employee")
plt.ylabel("Salary")
plt.show()
plt.hist(pdf["Salary"])
plt.title("Salary Distribution")
plt.xlabel("Salary")
plt.ylabel("Frequency")
plt.show()
