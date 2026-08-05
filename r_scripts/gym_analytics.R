# Fitness First Gym - Data Analytics Scripts
# Uses ggplot2 and dplyr for generating reports and charts from database exports.
# Run this script after exporting data from the Django admin or via API.

library(ggplot2)
library(dplyr)
library(tidyr)
library(lubridate)
library(scales)

# ============================================================
# 1. Monthly Revenue Chart
# ============================================================
plot_monthly_revenue <- function(data) {
  # data should have columns: month (Date), revenue (numeric)
  ggplot(data, aes(x = month, y = revenue)) +
    geom_line(color = "#1a56db", size = 1.5) +
    geom_point(color = "#1a56db", size = 3) +
    geom_area(fill = "#1a56db", alpha = 0.1) +
    scale_y_continuous(labels = dollar_format(prefix = "$")) +
    scale_x_date(date_labels = "%b %Y", date_breaks = "1 month") +
    labs(title = "Monthly Revenue Trend",
         subtitle = "Fitness First Gym",
         x = "Month", y = "Revenue ($)") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16),
          axis.text.x = element_text(angle = 45, hjust = 1))
  
  ggsave("r_scripts/output/monthly_revenue.png", width = 10, height = 6, dpi = 150)
}

# ============================================================
# 2. Membership Growth
# ============================================================
plot_membership_growth <- function(data) {
  # data: month (Date), new_members (integer), total_members (integer)
  ggplot(data, aes(x = month)) +
    geom_bar(aes(y = new_members, fill = "New Members"), stat = "identity", alpha = 0.8) +
    geom_line(aes(y = total_members, color = "Total Members"), size = 1.5) +
    scale_fill_manual(values = c("New Members" = "#3b82f6")) +
    scale_color_manual(values = c("Total Members" = "#10b981")) +
    scale_y_continuous(labels = comma) +
    scale_x_date(date_labels = "%b %Y", date_breaks = "2 months") +
    labs(title = "Membership Growth",
         x = "Month", y = "Members", fill = "", color = "") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16),
          legend.position = "bottom")
  
  ggsave("r_scripts/output/membership_growth.png", width = 10, height = 6, dpi = 150)
}

# ============================================================
# 3. Package Popularity
# ============================================================
plot_package_popularity <- function(data) {
  # data: package_name (character), count (integer)
  data %>%
    mutate(package_name = reorder(package_name, count)) %>%
    ggplot(aes(x = package_name, y = count, fill = count)) +
    geom_bar(stat = "identity", width = 0.7) +
    geom_text(aes(label = count), hjust = -0.2, size = 4) +
    scale_fill_gradient(low = "#93c5fd", high = "#1a56db") +
    coord_flip() +
    labs(title = "Package Popularity",
         subtitle = "Number of members per package type",
         x = "", y = "Members") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16),
          legend.position = "none")
  
  ggsave("r_scripts/output/package_popularity.png", width = 10, height = 6, dpi = 150)
}

# ============================================================
# 4. Attendance Heatmap Data
# ============================================================
plot_attendance_heatmap <- function(data) {
  # data: day_of_week (factor ordered), hour (integer), count (integer)
  ggplot(data, aes(x = hour, y = day_of_week, fill = count)) +
    geom_tile(color = "white", size = 0.5) +
    scale_fill_gradient(low = "#e0e7ff", high = "#1a56db", labels = comma) +
    scale_x_continuous(breaks = seq(5, 22, 1)) +
    labs(title = "Peak Attendance Hours",
         subtitle = "Gym Usage Heatmap",
         x = "Hour of Day", y = "Day of Week", fill = "Visits") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16),
          panel.grid = element_blank())
  
  ggsave("r_scripts/output/attendance_heatmap.png", width = 12, height = 6, dpi = 150)
}

# ============================================================
# 5. Age Distribution
# ============================================================
plot_age_distribution <- function(data) {
  # data: age (integer)
  ggplot(data, aes(x = age)) +
    geom_histogram(binwidth = 5, fill = "#1a56db", color = "white", alpha = 0.8) +
    scale_x_continuous(breaks = seq(10, 80, 5)) +
    labs(title = "Member Age Distribution",
         x = "Age Group", y = "Number of Members") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16))
  
  ggsave("r_scripts/output/age_distribution.png", width = 10, height = 6, dpi = 150)
}

# ============================================================
# 6. Gender Distribution
# ============================================================
plot_gender_distribution <- function(data) {
  # data: gender (character), count (integer)
  data %>%
    mutate(percentage = count / sum(count) * 100,
           label = paste0(gender, "\n", round(percentage, 1), "%")) %>%
    ggplot(aes(x = "", y = count, fill = gender)) +
    geom_bar(stat = "identity", width = 1) +
    coord_polar("y", start = 0) +
    geom_text(aes(label = label), position = position_stack(vjust = 0.5), size = 5) +
    scale_fill_manual(values = c("Male" = "#3b82f6", "Female" = "#f472b6", "Other" = "#a78bfa")) +
    labs(title = "Gender Distribution", fill = "") +
    theme_void() +
    theme(plot.title = element_text(face = "bold", size = 16, hjust = 0.5),
          legend.position = "bottom")
  
  ggsave("r_scripts/output/gender_distribution.png", width = 8, height = 8, dpi = 150)
}

# ============================================================
# 7. Revenue Forecast (Linear Regression)
# ============================================================
plot_revenue_forecast <- function(data) {
  # data: month (Date), revenue (numeric)
  model <- lm(revenue ~ as.numeric(month), data = data)
  
  # Forecast next 3 months
  future_months <- seq(max(data$month), by = "month", length.out = 4)[-1]
  future_data <- data.frame(month = future_months,
                            revenue = predict(model, newdata = data.frame(month = future_months)))
  
  full_data <- bind_rows(
    data %>% mutate(type = "Actual"),
    future_data %>% mutate(type = "Forecast")
  )
  
  ggplot(full_data, aes(x = month, y = revenue, color = type)) +
    geom_line(size = 1.5) +
    geom_point(size = 3) +
    geom_smooth(data = data, method = "lm", se = TRUE, color = "#1a56db", alpha = 0.2) +
    scale_color_manual(values = c("Actual" = "#1a56db", "Forecast" = "#ef4444")) +
    scale_y_continuous(labels = dollar_format(prefix = "$")) +
    scale_x_date(date_labels = "%b %Y") +
    labs(title = "Revenue Forecast",
         subtitle = "3-Month Projection",
         x = "Month", y = "Revenue ($)", color = "") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16),
          legend.position = "bottom")
  
  ggsave("r_scripts/output/revenue_forecast.png", width = 10, height = 6, dpi = 150)
}

# ============================================================
# 8. Trainer Performance
# ============================================================
plot_trainer_performance <- function(data) {
  # data: trainer_name (character), sessions (integer), rating (numeric 1-5)
  data %>%
    mutate(trainer_name = reorder(trainer_name, sessions)) %>%
    ggplot(aes(x = sessions, y = trainer_name, fill = rating)) +
    geom_bar(stat = "identity", width = 0.7) +
    geom_text(aes(label = paste0(sessions, " sessions")), hjust = -0.1, size = 3.5) +
    scale_fill_gradient(low = "#fef3c7", high = "#f59e0b", limits = c(1, 5)) +
    labs(title = "Trainer Performance",
         subtitle = "Sessions conducted & average rating",
         x = "Number of Sessions", y = "", fill = "Rating") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16))
  
  ggsave("r_scripts/output/trainer_performance.png", width = 10, height = 6, dpi = 150)
}

# ============================================================
# 9. Peak Attendance Hours
# ============================================================
plot_peak_hours <- function(data) {
  # data: hour (integer), avg_attendance (numeric)
  ggplot(data, aes(x = hour, y = avg_attendance)) +
    geom_bar(stat = "identity", fill = "#1a56db", alpha = 0.8, width = 0.7) +
    geom_smooth(se = FALSE, color = "#ef4444", size = 1) +
    scale_x_continuous(breaks = seq(5, 22, 1)) +
    labs(title = "Average Attendance by Hour",
         subtitle = "Peak Hours Analysis",
         x = "Hour of Day", y = "Average Attendance") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16))
  
  ggsave("r_scripts/output/peak_hours.png", width = 10, height = 6, dpi = 150)
}

# ============================================================
# Main: Export all charts from the live database CSVs
# ============================================================
# The Django backend exports real database data to r_scripts/data/
# (registered_users.csv, bookings.csv, payments.csv) before invoking
# this script via the /api/dashboard/reports/r/ endpoint.
dir.create("r_scripts/output", showWarnings = FALSE)

# Load CSV exports generated by the Django RReportAPIView
users_data <- read.csv("r_scripts/data/registered_users.csv", stringsAsFactors = FALSE)
bookings_data <- read.csv("r_scripts/data/bookings.csv", stringsAsFactors = FALSE)
payments_data <- read.csv("r_scripts/data/payments.csv", stringsAsFactors = FALSE)

# ------------------------------------------------------------
# Revenue Summary (monthly revenue from paid payments)
# ------------------------------------------------------------
if ("payment_date" %in% colnames(payments_data) && nrow(payments_data) > 0) {
  payments_data <- payments_data %>%
    filter(status == "paid") %>%
    mutate(
      month = as.Date(paste0(substr(payment_date, 1, 7), "-01")),
      revenue = as.numeric(amount)
    ) %>%
    group_by(month) %>%
    summarise(revenue = sum(revenue, na.rm = TRUE), .groups = "drop")

  plot_monthly_revenue(payments_data)
  plot_revenue_forecast(payments_data)
}

# ------------------------------------------------------------
# Membership Growth (new members per month from users)
# ------------------------------------------------------------
if ("date_joined" %in% colnames(users_data) && nrow(users_data) > 0) {
  growth_data <- users_data %>%
    mutate(month = as.Date(paste0(substr(date_joined, 1, 7), "-01"))) %>%
    group_by(month) %>%
    summarise(new_members = n(), .groups = "drop") %>%
    arrange(month) %>%
    mutate(total_members = cumsum(new_members))

  plot_membership_growth(growth_data)
}

# ------------------------------------------------------------
# Package Popularity (membership type from payments)
# ------------------------------------------------------------
if ("membership_type" %in% colnames(payments_data) && nrow(payments_data) > 0) {
  package_data <- payments_data %>%
    filter(membership_type != "", !is.na(membership_type)) %>%
    count(membership_type) %>%
    rename(package_name = membership_type, count = n)

  plot_package_popularity(package_data)
}

# ------------------------------------------------------------
# Gender & Age distributions (from real profile fields)
# ------------------------------------------------------------
if ("gender" %in% colnames(users_data) && nrow(users_data) > 0) {
  gender_data <- users_data %>%
    filter(gender != "", !is.na(gender)) %>%
    count(gender) %>%
    rename(gender = gender, count = n)

  if (nrow(gender_data) > 0) {
    plot_gender_distribution(gender_data)
  }
}

if ("age" %in% colnames(users_data) && nrow(users_data) > 0) {
  age_data <- users_data %>%
    filter(!is.na(age) & age != "")

  if (nrow(age_data) > 0) {
    age_data$age <- as.numeric(age_data$age)
    plot_age_distribution(age_data)
  }
}

# ------------------------------------------------------------
# Booking Trends (bookings per day)
# ------------------------------------------------------------
if ("created_at" %in% colnames(bookings_data) && nrow(bookings_data) > 0) {
  trend_data <- bookings_data %>%
    mutate(created_date = as.Date(created_at)) %>%
    count(created_date) %>%
    # dplyr's count() names the frequency column `n`, so rename it here.
    rename(day = created_date, bookings = n)

  # Chart booking trends using a bar plot
  p <- ggplot(trend_data, aes(x = day, y = bookings)) +
    geom_bar(stat = "identity", fill = "#1a56db", alpha = 0.8) +
    scale_x_date(date_labels = "%b %d") +
    labs(title = "Booking Trends", x = "Date", y = "Bookings") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16),
          axis.text.x = element_text(angle = 45, hjust = 1))
  ggsave("r_scripts/output/booking_trends.png", plot = p, width = 10, height = 6, dpi = 150)
}

cat("All analytics charts generated successfully!\n")
