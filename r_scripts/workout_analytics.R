# Fitness First Gym - Workout & Training Analytics Script
# Generates advanced training reports: workout volume trends, strength growth,
# attendance trends, member progress, and training analytics.
# Run from the Django project root; CSV inputs live in r_scripts/data/.
# Output PNGs are written to r_scripts/output/.

library(ggplot2)
library(dplyr)
library(tidyr)
library(lubridate)
library(scales)

out_dir <- "r_scripts/output"
dir.create(out_dir, showWarnings = FALSE, recursive = TRUE)

# ============================================================
# 1. Workout Volume Trend
# ============================================================
plot_workout_volume <- function(data) {
  if (nrow(data) == 0) return(NULL)
  data %>%
    mutate(month = floor_date(as.Date(date), "month")) %>%
    group_by(month) %>%
    summarise(volume = sum(total_volume, na.rm = TRUE),
              sessions = n(), .groups = "drop") %>%
    ggplot(aes(x = month, y = volume)) +
    geom_area(fill = "#f59e0b", alpha = 0.2) +
    geom_line(color = "#f59e0b", size = 1.5) +
    geom_point(color = "#f59e0b", size = 3) +
    scale_x_date(date_labels = "%b %Y", date_breaks = "1 month") +
    scale_y_continuous(labels = comma) +
    labs(title = "Training Volume Trend",
         subtitle = "Fitness First Gym - Total kilograms moved per month",
         x = "Month", y = "Volume (kg)") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16),
          axis.text.x = element_text(angle = 45, hjust = 1))

  ggsave(file.path(out_dir, "workout_volume.png"), width = 10, height = 6, dpi = 150)
}

# ============================================================
# 2. Workout Frequency / Sessions per Week
# ============================================================
plot_workout_frequency <- function(data) {
  if (nrow(data) == 0) return(NULL)
  data %>%
    group_by(date) %>%
    summarise(sessions = n(), .groups = "drop") %>%
    ggplot(aes(x = as.Date(date), y = sessions)) +
    geom_bar(stat = "identity", fill = "#3b82f6", alpha = 0.85) +
    scale_x_date(date_labels = "%b %d", date_breaks = "1 month") +
    scale_y_continuous(labels = comma) +
    labs(title = "Workout Frequency",
         subtitle = "Number of workouts logged per day",
         x = "Date", y = "Workouts") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16),
          axis.text.x = element_text(angle = 45, hjust = 1))

  ggsave(file.path(out_dir, "workout_frequency.png"), width = 10, height = 6, dpi = 150)
}

# ============================================================
# 3. Workout Type Distribution
# ============================================================
plot_workout_types <- function(data) {
  if (nrow(data) == 0) return(NULL)
  data %>%
    count(workout_type, name = "count") %>%
    ggplot(aes(x = reorder(workout_type, count), y = count, fill = workout_type)) +
    geom_bar(stat = "identity", show.legend = FALSE) +
    coord_flip() +
    scale_y_continuous(labels = comma) +
    labs(title = "Workout Type Distribution",
         subtitle = "Distribution of workouts by type",
         x = "", y = "Number of Workouts") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16),
          axis.text.y = element_text(size = 11))

  ggsave(file.path(out_dir, "workout_types.png"), width = 10, height = 6, dpi = 150)
}

# ============================================================
# 4. Member Weight Trend (Body Measurements)
# ============================================================
plot_weight_trend <- function(data) {
  if (nrow(data) == 0) return(NULL)
  data %>%
    mutate(date = as.Date(date)) %>%
    na.omit() %>%
    ggplot(aes(x = date, y = weight_kg)) +
    geom_smooth(method = "loess", se = TRUE, color = "#8b5cf6", fill = "#8b5cf6", alpha = 0.15) +
    geom_point(color = "#6d28d9", size = 2, alpha = 0.7) +
    scale_x_date(date_labels = "%b %d", date_breaks = "1 month") +
    labs(title = "Member Weight Trend",
         subtitle = "Body weight progression over time",
         x = "Date", y = "Weight (kg)") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16),
          axis.text.x = element_text(angle = 45, hjust = 1))

  ggsave(file.path(out_dir, "member_weight.png"), width = 10, height = 6, dpi = 150)
}

# ============================================================
# 5. Training Volume by Member (Top Members)
# ============================================================
plot_top_members <- function(data) {
  if (nrow(data) == 0) return(NULL)
  data %>%
    group_by(user) %>%
    summarise(total_volume = sum(total_volume, na.rm = TRUE),
              workouts = n(), .groups = "drop") %>%
    arrange(desc(total_volume)) %>%
    head(10) %>%
    mutate(user = reorder(user, total_volume)) %>%
    ggplot(aes(x = user, y = total_volume, fill = total_volume)) +
    geom_bar(stat = "identity", show.legend = FALSE) +
    coord_flip() +
    scale_y_continuous(labels = comma) +
    labs(title = "Top Members by Training Volume",
         subtitle = "Total volume (kg) per member",
         x = "", y = "Total Volume (kg)") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16))

  ggsave(file.path(out_dir, "top_members.png"), width = 10, height = 7, dpi = 150)
}

# ============================================================
# 6. Duration / Average Workout Time
# ============================================================
plot_duration_trend <- function(data) {
  if (nrow(data) == 0) return(NULL)
  data %>%
    filter(!is.na(duration_minutes)) %>%
    mutate(month = floor_date(as.Date(date), "month")) %>%
    group_by(month) %>%
    summarise(avg_duration = mean(duration_minutes, na.rm = TRUE), .groups = "drop") %>%
    ggplot(aes(x = month, y = avg_duration)) +
    geom_line(color = "#10b981", size = 1.5) +
    geom_point(color = "#10b981", size = 3) +
    scale_x_date(date_labels = "%b %Y", date_breaks = "1 month") +
    labs(title = "Average Workout Duration",
         subtitle = "Average session length per month (minutes)",
         x = "Month", y = "Minutes") +
    theme_minimal() +
    theme(plot.title = element_text(face = "bold", size = 16),
          axis.text.x = element_text(angle = 45, hjust = 1))

  ggsave(file.path(out_dir, "workout_duration.png"), width = 10, height = 6, dpi = 150)
}

# ============================================================
# MAIN
# ============================================================
main <- function() {
  data_dir <- "r_scripts/data"

  workouts <- tryCatch(read.csv(file.path(data_dir, "workouts.csv"), stringsAsFactors = FALSE),
                       error = function(e) data.frame())
  measurements <- tryCatch(read.csv(file.path(data_dir, "measurements.csv"), stringsAsFactors = FALSE),
                           error = function(e) data.frame())

  if (nrow(workouts) > 0) {
    workouts <- workouts %>%
      mutate(across(c(total_volume, duration_minutes), ~ suppressWarnings(as.numeric(.))))
    plot_workout_volume(workouts)
    plot_workout_frequency(workouts)
    plot_workout_types(workouts)
    plot_top_members(workouts)
    plot_duration_trend(workouts)
  }

  if (nrow(measurements) > 0) {
    measurements <- measurements %>%
      mutate(weight_kg = suppressWarnings(as.numeric(weight_kg)))
    plot_weight_trend(measurements)
  }

  # Print the list of generated charts to stdout.
  generated <- list.files(out_dir, pattern = "\\.png$")
  cat(paste0("GENERATED_CHARTS:", paste(generated, collapse = ","), "\n"))
}

main()
