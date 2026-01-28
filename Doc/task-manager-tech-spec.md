# Task Management Application - Technical Specification

**Version:** 1.0  
**Date:** January 28, 2026  
**Platform:** macOS and Windows  
**Framework:** .NET MAUI  
**Development Environment:** macOS

---

## 1. Executive Summary

This document outlines the technical specifications for a cross-platform desktop task management application designed to help users organize daily tasks using a calendar-based Kanban board interface. The application features time tracking, customizable workflows, holiday integration, data analytics, and local data storage with import/export capabilities.

---

## 2. Technology Stack

### 2.1 Core Framework
- **.NET MAUI** (Multi-platform App UI)
- **Target Platforms:** macOS, Windows
- **Development Platform:** macOS
- **Minimum .NET Version:** .NET 8.0 or higher

### 2.2 Key Libraries & Dependencies

#### UI & Animation
- **Microsoft.Maui.Controls** - Core UI framework
- **Microsoft.Maui.Graphics** - Drawing and graphics
- **CommunityToolkit.Maui** - Additional UI controls and animations
- **SkiaSharp** - For particle animations and custom graphics

#### Data Management
- **System.Text.Json** - JSON serialization/deserialization
- **SQLite-net-pcl** (optional) - For improved data querying if needed

#### HTTP & API
- **System.Net.Http.HttpClient** - REST API calls
- **OpenHolidaysAPI** - Holiday data integration

#### Drag & Drop
- Platform-specific implementations using MAUI handlers

#### Localization
- **Microsoft.Extensions.Localization** - Resource-based localization

---

## 3. Application Architecture

### 3.1 Architecture Pattern
**MVVM (Model-View-ViewModel)** with the following structure:

```
TaskManager/
├── Models/
│   ├── Card.cs
│   ├── Column.cs
│   ├── Tag.cs
│   ├── CardTemplate.cs
│   ├── WorkDay.cs
│   ├── Holiday.cs
│   └── AppSettings.cs
├── ViewModels/
│   ├── MainViewModel.cs
│   ├── CalendarViewModel.cs
│   ├── BoardViewModel.cs
│   ├── DashboardViewModel.cs
│   ├── SettingsViewModel.cs
│   └── OnboardingViewModel.cs
├── Views/
│   ├── MainPage.xaml
│   ├── CalendarView.xaml
│   ├── BoardView.xaml
│   ├── DashboardView.xaml
│   ├── SettingsView.xaml
│   └── OnboardingView.xaml
├── Services/
│   ├── DataService.cs
│   ├── HolidayService.cs
│   ├── ExportImportService.cs
│   ├── TimeTrackingService.cs
│   └── AnimationService.cs
├── Resources/
│   ├── Strings/
│   │   ├── en.resx
│   │   ├── es.resx
│   │   └── [other languages].resx
│   └── Styles/
│       └── Themes.xaml
└── Data/
    └── [User data storage location]
```

### 3.2 Data Flow

1. **User Interaction** → View (XAML)
2. **View** → ViewModel (via data binding and commands)
3. **ViewModel** → Service Layer (business logic)
4. **Service Layer** → Data Storage (JSON files)
5. **Service Layer** → External API (Holiday API)

---

## 4. Core Features Specification

### 4.1 Calendar View

#### 4.1.1 Functionality
- Display monthly calendar grid showing current month
- Highlight current day with distinct visual indicator
- Mark holidays with visual indicators (e.g., different background color)
- Mark work days vs. non-work days based on user settings
- Click on any day to navigate to that day's board view

#### 4.1.2 Technical Implementation
- **Control:** Custom calendar control using MAUI Grid or CollectionView
- **Data Binding:** Observable collection of day objects
- **State Management:** Track selected day, current month/year

#### 4.1.3 UI Elements
```
┌─────────────────────────────────────┐
│  ← January 2026 →                   │
├─────────────────────────────────────┤
│ Mon Tue Wed Thu Fri Sat Sun         │
│     1   2   3   4   5   6   7       │
│  8   9  10  11  12  13  14          │
│ 15  16  17  18  19  20  21          │
│ 22  23  24  25  26  27  28          │
│ 29  30  31                          │
└─────────────────────────────────────┘
```

### 4.2 Board View (Kanban)

#### 4.2.1 Default Columns (Static)
These columns cannot be deleted and serve as the foundation for time tracking:

1. **TODO** - Initial state for new tasks
2. **Doing** - Tasks currently being worked on
3. **Done** - Completed tasks

#### 4.2.2 Custom Columns
- Users can create unlimited custom columns
- Custom columns can be:
  - Created (via "Add Column" button)
  - Renamed
  - Reordered (drag to reposition)
  - Deleted (with data migration handling)
- Position: Custom columns can be inserted anywhere in the workflow

#### 4.2.3 Data Migration for Deleted Columns
When a custom column is deleted:
1. Display confirmation dialog showing number of cards affected
2. Provide options:
   - Move all cards to TODO column
   - Move all cards to a selected existing column
   - Delete all cards in the column (with additional confirmation)
3. Log the migration in the card's history for audit purposes

#### 4.2.4 Column Structure
```json
{
  "id": "uuid",
  "name": "Column Name",
  "position": 0,
  "isStatic": true/false,
  "cards": []
}
```

#### 4.2.5 Board Layout
```
┌────────────────────────────────────────────────────┐
│  January 15, 2026                    [+Add Column]  │
├─────────────┬────────────┬──────────┬──────────────┤
│   TODO      │   Doing    │  Review  │    Done      │
│  [3 cards]  │ [2 cards]  │ [1 card] │  [5 cards]   │
│             │            │          │              │
│  ┌────────┐ │ ┌────────┐ │┌────────┐│ ┌────────┐  │
│  │ Card 1 │ │ │ Card 4 │ ││ Card 6 ││ │ Card 7 │  │
│  └────────┘ │ └────────┘ │└────────┘│ └────────┘  │
│  ┌────────┐ │ ┌────────┐ │          │ ┌────────┐  │
│  │ Card 2 │ │ │ Card 5 │ │          │ │ Card 8 │  │
│  └────────┘ │ └────────┘ │          │ └────────┘  │
│  ┌────────┐ │            │          │              │
│  │ Card 3 │ │            │          │              │
│  └────────┘ │            │          │              │
└─────────────┴────────────┴──────────┴──────────────┘
```

### 4.3 Card Management

#### 4.3.1 Card Data Model
```csharp
public class Card
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime CreatedDate { get; set; }
    public string ColumnId { get; set; }
    public string TemplateId { get; set; }
    public List<string> Tags { get; set; }
    public List<ChecklistItem> Checklist { get; set; }
    public List<CardMovement> MovementHistory { get; set; }
}

public class ChecklistItem
{
    public string Id { get; set; }
    public string Text { get; set; }
    public bool IsCompleted { get; set; }
}

public class CardMovement
{
    public string Id { get; set; }
    public string FromColumnId { get; set; }
    public string ToColumnId { get; set; }
    public DateTime Timestamp { get; set; }
}
```

#### 4.3.2 Card Features

**Basic Properties:**
- Title (with optional template prefix)
- Description (rich text with clickable hyperlinks)
- Tags (multiple custom tags)
- Checklist items (add/remove/complete)

**Template System:**
- User-defined templates with custom prefixes
- Example: Bug template adds "[BUG] - " prefix automatically
- Custom header colors per template
- Templates managed in Settings

**Movement Tracking:**
- Each card movement between columns is timestamped
- Movement history stored in `MovementHistory` array
- Used for time tracking analytics

**Actions:**
- Move to next work day (skip weekends/holidays)
- Duplicate card
- Delete card (with confirmation)
- Edit card details

#### 4.3.3 Drag and Drop Implementation

**Technical Requirements:**
- Smooth animation during drag
- Visual feedback (card elevation, opacity)
- Drop zones highlighted when dragging
- Snap-to-grid or smooth placement
- Touch and mouse support

**Animation Specifications:**
- Drag start: Scale up to 1.05x, add shadow
- During drag: Follow pointer with slight delay (ease-out)
- Drop: Smooth transition to final position with spring animation
- Invalid drop: Bounce back to original position

**Completion Animation:**
When a card is moved to "Done" column:
- Particle effect (confetti or sparkles)
- Brief scale pulse animation (1.0x → 1.1x → 1.0x)
- Optional sound effect (can be disabled in settings)

### 4.4 Time Tracking System

#### 4.4.1 Automatic Tracking
- Every card movement between columns records:
  - Source column
  - Destination column
  - Timestamp
- Data stored in card's `MovementHistory`

#### 4.4.2 Duration Calculation
```csharp
// Example calculation logic
public TimeSpan GetTimeInColumn(Card card, string columnId)
{
    var entries = card.MovementHistory
        .Where(m => m.FromColumnId == columnId)
        .ToList();
    
    TimeSpan totalTime = TimeSpan.Zero;
    
    foreach (var entry in entries)
    {
        var entryTime = entry.Timestamp;
        var exitTime = GetNextMovementTime(card, entry);
        totalTime += exitTime - entryTime;
    }
    
    return totalTime;
}
```

#### 4.4.3 "Nerd Stats" Display
For each card, display:
- Total time in each column
- Time in TODO
- Time in Doing
- Time in custom columns
- Total time from creation to completion
- Average time per column
- First created date
- Completion date (if applicable)

**Display Format:**
```
Card Statistics
───────────────
Created: Jan 15, 2026 9:00 AM
Completed: Jan 18, 2026 3:30 PM
Total Duration: 3 days 6 hours 30 minutes

Time in Columns:
• TODO: 2 hours 15 minutes
• Doing: 5 hours 45 minutes  
• Review: 1 hour 30 minutes
• Done: N/A
```

### 4.5 Holiday Integration

#### 4.5.1 OpenHolidaysAPI Integration

**Base URL:** `https://openholidaysapi.org`

**Required Endpoints:**

1. **Get Countries**
   ```
   GET /Countries
   Accept: application/json
   ```
   Response: List of country objects with ISO codes

2. **Get Languages**
   ```
   GET /Languages
   Accept: application/json
   ```
   Response: Available language codes

3. **Get Subdivisions**
   ```
   GET /Subdivisions?countryIsoCode={code}
   Accept: application/json
   ```
   Response: Regional subdivisions for a country

4. **Get Holidays**
   ```
   GET /PublicHolidays?countryIsoCode={code}&languageIsoCode={lang}&validFrom={date}&validTo={date}
   Accept: application/json
   ```
   Response: List of holidays for specified date range

#### 4.5.2 Holiday Service Implementation

```csharp
public class HolidayService
{
    private readonly HttpClient _httpClient;
    private const string BaseUrl = "https://openholidaysapi.org";
    
    public async Task<List<Country>> GetCountriesAsync()
    {
        // Implementation
    }
    
    public async Task<List<Holiday>> GetHolidaysAsync(
        string countryCode, 
        DateTime startDate, 
        DateTime endDate)
    {
        // Implementation
    }
    
    public async Task<bool> CheckInternetConnection()
    {
        // Test connectivity before API calls
    }
}
```

#### 4.5.3 Offline Handling
- Cache downloaded holidays locally
- Display warning if no internet connection on first run
- Allow app to function without holiday data (manual holiday marking)
- Retry mechanism for failed API calls

#### 4.5.4 Multiple Country Support
- Users can select multiple countries
- Holidays from all selected countries are displayed
- Each holiday shows country of origin in tooltip/detail view

### 4.6 Work Day Configuration

#### 4.6.1 Default Configuration
- **Work Days:** Monday - Friday
- **Non-Work Days:** Saturday, Sunday
- **Holidays:** Fetched from API based on selected countries

#### 4.6.2 Custom Configuration
Users can modify in Settings:
- Select which days of the week are work days
- Add custom holidays (manual entry)
- Remove specific holidays from the calendar

#### 4.6.3 "Move to Next Work Day" Function
When moving a card to next work day:
1. Calculate next work day from current date
2. Skip weekends based on work day configuration
3. Skip holidays from selected countries
4. Create a copy of the card on the calculated date
5. Original card can be marked as moved or archived

```csharp
public DateTime GetNextWorkDay(DateTime currentDate, AppSettings settings)
{
    DateTime nextDay = currentDate.AddDays(1);
    
    while (!IsWorkDay(nextDay, settings))
    {
        nextDay = nextDay.AddDays(1);
    }
    
    return nextDay;
}

private bool IsWorkDay(DateTime date, AppSettings settings)
{
    // Check if day of week is in work days
    if (!settings.WorkDays.Contains(date.DayOfWeek))
        return false;
        
    // Check if date is a holiday
    if (settings.Holidays.Any(h => h.Date.Date == date.Date))
        return false;
        
    return true;
}
```

### 4.7 Tags System

#### 4.7.1 Tag Data Model
```csharp
public class Tag
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Color { get; set; } // Hex color code
}
```

#### 4.7.2 Tag Features
- Create custom tags
- Assign multiple tags to a card
- Color-coded visual representation
- Filter/search cards by tags
- Tag management in Settings

#### 4.7.3 Tag UI Display
```
Card Title
───────────────────────────────
[Bug] [High Priority] [Backend]
Description text here...
```

### 4.8 Dashboard & Analytics

#### 4.8.1 Time Frame Selection
- Last 7 days
- Last 1 month
- Last 3 months
- Last 6 months
- Last year
- Custom date range

#### 4.8.2 Visualizations

**1. Task Completion Chart (Line/Bar)**
- X-axis: Time period (days/weeks/months)
- Y-axis: Number of tasks completed
- Shows completion trend over time

**2. Time Distribution Pie Chart**
- Show percentage of time spent in each column
- Example: TODO (20%), Doing (60%), Review (15%), Done (5%)

**3. Cards by Status (Bar Chart)**
- Current snapshot of cards in each column
- Stacked bar showing cards by tag or template

**4. Average Completion Time**
- Display average time from creation to done
- Comparison across time periods

**5. Task Velocity**
- Tasks completed per week/month
- Trend line showing improvement or decline

**6. Tag Distribution**
- Show which tags are most used
- Time spent on cards with specific tags

#### 4.8.3 Data Aggregation

```csharp
public class DashboardData
{
    public int TotalCardsCreated { get; set; }
    public int TotalCardsCompleted { get; set; }
    public int CardsInProgress { get; set; }
    public TimeSpan AverageCompletionTime { get; set; }
    public Dictionary<string, int> CardsByColumn { get; set; }
    public Dictionary<string, TimeSpan> TimeByColumn { get; set; }
    public List<DailyStats> DailyBreakdown { get; set; }
}

public class DailyStats
{
    public DateTime Date { get; set; }
    public int CardsCreated { get; set; }
    public int CardsCompleted { get; set; }
    public int CardsMoved { get; set; }
}
```

#### 4.8.4 Chart Implementation
**Library:** Use **Syncfusion Charts for MAUI** or **Microcharts** or **LiveCharts2**
- Interactive charts with hover tooltips
- Export chart as image
- Responsive design for different screen sizes

---

## 5. Data Storage & Management

### 5.1 Data Storage Strategy

#### 5.1.1 Storage Location
**Platform-specific paths:**
- **macOS:** `~/Library/Application Support/TaskManager/`
- **Windows:** `%APPDATA%/TaskManager/`

#### 5.1.2 Directory Structure
```
TaskManager/
├── 2024/
│   ├── January.json
│   ├── February.json
│   ├── ...
│   └── December.json
├── 2025/
│   ├── January.json
│   ├── February.json
│   ├── ...
│   └── December.json
├── 2026/
│   └── January.json
├── settings.json
├── templates.json
├── tags.json
└── holidays.json
```

#### 5.1.3 File Organization Rationale
- **Yearly folders** improve performance and organization
- **Monthly JSON files** balance file size and granularity
- Separate files for configuration data
- Enables easy backup and archival of old data

### 5.2 Data Models

#### 5.2.1 Monthly Board Data (e.g., January.json)
```json
{
  "year": 2026,
  "month": 1,
  "days": [
    {
      "date": "2026-01-15",
      "isWorkDay": true,
      "isHoliday": false,
      "columns": [
        {
          "id": "col-1",
          "name": "TODO",
          "isStatic": true,
          "position": 0,
          "cards": [
            {
              "id": "card-123",
              "title": "[BUG] - Login issue",
              "description": "Users can't log in with SSO. Check: https://github.com/repo/issues/42",
              "createdDate": "2026-01-15T09:00:00Z",
              "templateId": "template-bug",
              "tags": ["bug", "high-priority", "backend"],
              "checklist": [
                {
                  "id": "check-1",
                  "text": "Investigate SSO configuration",
                  "isCompleted": true
                },
                {
                  "id": "check-2",
                  "text": "Test fix in staging",
                  "isCompleted": false
                }
              ],
              "movementHistory": [
                {
                  "id": "move-1",
                  "fromColumnId": null,
                  "toColumnId": "col-1",
                  "timestamp": "2026-01-15T09:00:00Z"
                }
              ]
            }
          ]
        },
        {
          "id": "col-2",
          "name": "Doing",
          "isStatic": true,
          "position": 1,
          "cards": []
        },
        {
          "id": "col-3",
          "name": "Done",
          "isStatic": true,
          "position": 2,
          "cards": []
        }
      ]
    }
  ]
}
```

#### 5.2.2 Settings Data (settings.json)
```json
{
  "version": "1.0",
  "theme": "dark",
  "language": "en",
  "workDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "selectedCountries": [
    {
      "code": "US",
      "name": "United States",
      "subdivisions": []
    }
  ],
  "notifications": {
    "enabled": true,
    "soundEnabled": false
  },
  "animations": {
    "enabled": true,
    "particleEffects": true
  }
}
```

#### 5.2.3 Templates Data (templates.json)
```json
{
  "templates": [
    {
      "id": "template-bug",
      "name": "Bug",
      "prefix": "[BUG] - ",
      "headerColor": "#FF5252",
      "defaultTags": ["bug"]
    },
    {
      "id": "template-feature",
      "name": "Feature",
      "prefix": "[FEATURE] - ",
      "headerColor": "#4CAF50",
      "defaultTags": ["feature"]
    }
  ]
}
```

#### 5.2.4 Tags Data (tags.json)
```json
{
  "tags": [
    {
      "id": "tag-1",
      "name": "bug",
      "color": "#FF5252"
    },
    {
      "id": "tag-2",
      "name": "high-priority",
      "color": "#FF9800"
    },
    {
      "id": "tag-3",
      "name": "backend",
      "color": "#2196F3"
    }
  ]
}
```

#### 5.2.5 Holidays Cache (holidays.json)
```json
{
  "lastUpdated": "2026-01-15T00:00:00Z",
  "holidays": [
    {
      "date": "2026-01-01",
      "name": "New Year's Day",
      "countryCode": "US",
      "isOfficial": true
    },
    {
      "date": "2026-12-25",
      "name": "Christmas Day",
      "countryCode": "US",
      "isOfficial": true
    }
  ]
}
```

### 5.3 Data Service Implementation

```csharp
public class DataService
{
    private readonly string _dataPath;
    
    public DataService()
    {
        _dataPath = GetPlatformDataPath();
        EnsureDirectoryStructure();
    }
    
    private string GetPlatformDataPath()
    {
        #if __MACOS__
            return Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "TaskManager"
            );
        #elif WINDOWS
            return Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "TaskManager"
            );
        #endif
    }
    
    public async Task<MonthlyBoard> LoadMonthDataAsync(int year, int month)
    {
        string filePath = Path.Combine(_dataPath, year.ToString(), $"{GetMonthName(month)}.json");
        
        if (!File.Exists(filePath))
        {
            return CreateEmptyMonthBoard(year, month);
        }
        
        string json = await File.ReadAllTextAsync(filePath);
        return JsonSerializer.Deserialize<MonthlyBoard>(json);
    }
    
    public async Task SaveMonthDataAsync(MonthlyBoard board)
    {
        string folderPath = Path.Combine(_dataPath, board.Year.ToString());
        Directory.CreateDirectory(folderPath);
        
        string filePath = Path.Combine(folderPath, $"{GetMonthName(board.Month)}.json");
        string json = JsonSerializer.Serialize(board, new JsonSerializerOptions 
        { 
            WriteIndented = true 
        });
        
        await File.WriteAllTextAsync(filePath, json);
    }
    
    public async Task<AppSettings> LoadSettingsAsync()
    {
        string filePath = Path.Combine(_dataPath, "settings.json");
        
        if (!File.Exists(filePath))
        {
            return GetDefaultSettings();
        }
        
        string json = await File.ReadAllTextAsync(filePath);
        return JsonSerializer.Deserialize<AppSettings>(json);
    }
    
    public async Task SaveSettingsAsync(AppSettings settings)
    {
        string filePath = Path.Combine(_dataPath, "settings.json");
        string json = JsonSerializer.Serialize(settings, new JsonSerializerOptions 
        { 
            WriteIndented = true 
        });
        
        await File.WriteAllTextAsync(filePath, json);
    }
}
```

### 5.4 Export & Import

#### 5.4.1 Export Functionality
- Export entire data folder as ZIP archive
- Include all yearly folders and configuration files
- File naming: `TaskManager_Backup_YYYY-MM-DD.zip`
- Export location: User-selected via file picker

#### 5.4.2 Import Functionality
- Import from ZIP archive
- Validate data structure and JSON format
- Options:
  - **Merge:** Combine with existing data
  - **Replace:** Overwrite all existing data
  - **Selective:** Choose specific years/months to import
- Show preview of what will be imported
- Create backup of current data before import

#### 5.4.3 Validation
```csharp
public class ImportValidator
{
    public ValidationResult ValidateImport(string zipPath)
    {
        var result = new ValidationResult();
        
        // Extract to temp directory
        var tempDir = ExtractToTemp(zipPath);
        
        // Check for required files
        result.HasSettings = File.Exists(Path.Combine(tempDir, "settings.json"));
        result.HasTemplates = File.Exists(Path.Combine(tempDir, "templates.json"));
        result.HasTags = File.Exists(Path.Combine(tempDir, "tags.json"));
        
        // Validate JSON structure
        result.IsValid = ValidateJsonStructure(tempDir);
        
        // Check version compatibility
        result.VersionCompatible = CheckVersion(tempDir);
        
        return result;
    }
}
```

---

## 6. User Interface Specifications

### 6.1 Onboarding Flow

#### 6.1.1 Initial Launch Screen
**Screen 1: Welcome**
```
┌─────────────────────────────────────┐
│                                     │
│     Welcome to TaskManager          │
│                                     │
│   Organize your daily tasks         │
│   Track your productivity           │
│                                     │
│   [Get Started]  [Import Data]     │
│                                     │
└─────────────────────────────────────┘
```

**Screen 2: Work Days Configuration**
```
┌─────────────────────────────────────┐
│  Configure Your Work Week           │
│                                     │
│  Select your working days:          │
│                                     │
│  [✓] Monday                         │
│  [✓] Tuesday                        │
│  [✓] Wednesday                      │
│  [✓] Thursday                       │
│  [✓] Friday                         │
│  [ ] Saturday                       │
│  [ ] Sunday                         │
│                                     │
│  [Back]              [Next]         │
└─────────────────────────────────────┘
```

**Screen 3: Country Selection**
```
┌─────────────────────────────────────┐
│  Select Your Country                │
│                                     │
│  Choose country for holidays:       │
│                                     │
│  🔍 Search countries...             │
│                                     │
│  [ ] United States                  │
│  [ ] United Kingdom                 │
│  [ ] Canada                         │
│  [ ] Germany                        │
│  ...                                │
│                                     │
│  ℹ️ Requires internet connection    │
│                                     │
│  [Back]              [Finish]       │
└─────────────────────────────────────┘
```

**Import Data Alternative:**
```
┌─────────────────────────────────────┐
│  Import Existing Data               │
│                                     │
│  📁 Select backup file (.zip)       │
│                                     │
│  [Choose File]                      │
│                                     │
│  Selected: None                     │
│                                     │
│  Validating...                      │
│                                     │
│  [Cancel]            [Import]       │
└─────────────────────────────────────┘
```

### 6.2 Main Application Layout

```
┌────────────────────────────────────────────────────────────┐
│ TaskManager                    [Dashboard] [Settings] [☰]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ← January 2026 →                                         │
│  ┌───────────────────────────────────────────────────┐    │
│  │  Mon  Tue  Wed  Thu  Fri  Sat  Sun               │    │
│  │        1    2    3    4    5    6    7           │    │
│  │   8    9   10   11   12   13   14                │    │
│  │  15   16   17   18   19   20   21                │    │
│  │  22   23   24   25   26   27   28                │    │
│  │  29   30   31                                     │    │
│  └───────────────────────────────────────────────────┘    │
│                                                            │
│  Selected: January 15, 2026 (Wednesday)                   │
│                                                            │
│  ┌─────────────────────────────────────────────────┐      │
│  │  TODO        Doing       Review        Done     │      │
│  │  ───────     ───────     ───────       ────     │      │
│  │  [Card 1]    [Card 4]    [Card 6]    [Card 7]  │      │
│  │  [Card 2]    [Card 5]                 [Card 8]  │      │
│  │  [Card 3]                             [Card 9]  │      │
│  │                                                  │      │
│  │  [+ Add Card]                                   │      │
│  └─────────────────────────────────────────────────┘      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 6.3 Card Detail View

```
┌─────────────────────────────────────────┐
│  [BUG] - Login issue            [✕]     │
├─────────────────────────────────────────┤
│                                         │
│  Template: 🐛 Bug                       │
│  Tags: [bug] [high-priority] [backend]  │
│                                         │
│  Description:                           │
│  ┌───────────────────────────────────┐  │
│  │ Users can't log in with SSO.      │  │
│  │ Check: https://github.com/...     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Checklist:                             │
│  [✓] Investigate SSO configuration      │
│  [ ] Test fix in staging                │
│  [ ] Deploy to production               │
│  [+ Add item]                           │
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  Created: Jan 15, 2026 9:00 AM          │
│  Time in TODO: 2h 15m                   │
│  Total time: 3d 6h 30m                  │
│                                         │
│  [📊 Stats] [➡️ Next Day] [🗑️ Delete]  │
│                                         │
│  [Cancel]                    [Save]     │
└─────────────────────────────────────────┘
```

### 6.4 Dashboard View

```
┌────────────────────────────────────────────────────────────┐
│ Dashboard                        Time Range: [Last Month ▾] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Summary Statistics:                                       │
│  ┌─────────────┬─────────────┬─────────────┬───────────┐  │
│  │ Total       │ Completed   │ In Progress │ Avg Time  │  │
│  │   45        │     32      │     13      │  2.3 days │  │
│  └─────────────┴─────────────┴─────────────┴───────────┘  │
│                                                            │
│  Task Completion Trend:                                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                    ╱─╲               │  │
│  │                            ╱──╲  ╱   ╲              │  │
│  │                    ╱──╲  ╱    ╲╱     ╲              │  │
│  │            ╱──╲  ╱    ╲╱              ╲             │  │
│  │    ╱──╲  ╱    ╲╱                                    │  │
│  │  ╱     ╲╱                                           │  │
│  │ W1  W2  W3  W4  W5  W6  W7  W8                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  Time Distribution:           Cards by Tag:               │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │       📊         │         │  Bug: 12         │        │
│  │    TODO: 20%     │         │  Feature: 18     │        │
│  │    Doing: 60%    │         │  Docs: 5         │        │
│  │    Review: 15%   │         │  Other: 10       │        │
│  │    Done: 5%      │         └──────────────────┘        │
│  └──────────────────┘                                     │
│                                                            │
│  [Export Report]                                          │
└────────────────────────────────────────────────────────────┘
```

### 6.5 Settings View

```
┌────────────────────────────────────────────────────────────┐
│ Settings                                         [✕ Close]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ▼ Appearance                                              │
│     Theme: ◉ Dark  ○ Light                                 │
│     Language: [English ▾]                                  │
│     Animations: [✓] Enable                                 │
│     Particle Effects: [✓] Enable                           │
│                                                            │
│  ▼ Work Schedule                                           │
│     Work Days:                                             │
│       [✓] Monday   [✓] Tuesday   [✓] Wednesday            │
│       [✓] Thursday [✓] Friday    [ ] Saturday             │
│       [ ] Sunday                                           │
│                                                            │
│  ▼ Holidays                                                │
│     Countries:                                             │
│       • United States                     [Remove]         │
│       • Canada                            [Remove]         │
│     [+ Add Country]                                        │
│                                                            │
│  ▼ Card Templates                                          │
│     Templates:                                             │
│       🐛 Bug - [BUG] - #FF5252           [Edit] [Delete]  │
│       ✨ Feature - [FEATURE] - #4CAF50   [Edit] [Delete]  │
│     [+ Create Template]                                    │
│                                                            │
│  ▼ Tags                                                    │
│     Tags:                                                  │
│       [bug] #FF5252                      [Edit] [Delete]   │
│       [high-priority] #FF9800            [Edit] [Delete]   │
│     [+ Create Tag]                                         │
│                                                            │
│  ▼ Data Management                                         │
│     [📦 Export Data]                                       │
│     [📥 Import Data]                                       │
│     [🗑️ Clear All Data]                                   │
│                                                            │
│  [Save Changes]                                           │
└────────────────────────────────────────────────────────────┘
```

### 6.6 Theme Specifications

#### 6.6.1 Dark Theme
```
Primary Background: #1E1E1E
Secondary Background: #2D2D2D
Card Background: #383838
Text Primary: #FFFFFF
Text Secondary: #B0B0B0
Accent: #4A9EFF
Border: #404040
```

#### 6.6.2 Light Theme
```
Primary Background: #FFFFFF
Secondary Background: #F5F5F5
Card Background: #FFFFFF
Text Primary: #212121
Text Secondary: #757575
Accent: #2196F3
Border: #E0E0E0
```

---

## 7. Technical Implementation Details

### 7.1 Animation System

#### 7.1.1 Card Drag Animation
```csharp
public class CardDragBehavior
{
    private double _startX, _startY;
    private bool _isDragging;
    
    public async Task OnDragStarted(View card, Point position)
    {
        _isDragging = true;
        _startX = position.X;
        _startY = position.Y;
        
        // Scale up and add shadow
        await Task.WhenAll(
            card.ScaleTo(1.05, 100, Easing.CubicOut),
            card.FadeTo(0.9, 100)
        );
    }
    
    public void OnDragging(View card, Point position)
    {
        if (!_isDragging) return;
        
        // Follow pointer with smooth translation
        card.TranslationX = position.X - _startX;
        card.TranslationY = position.Y - _startY;
    }
    
    public async Task OnDragCompleted(View card, bool isValidDrop)
    {
        _isDragging = false;
        
        if (isValidDrop)
        {
            // Snap to new position
            await Task.WhenAll(
                card.ScaleTo(1.0, 150, Easing.SpringOut),
                card.FadeTo(1.0, 150),
                card.TranslateTo(0, 0, 200, Easing.CubicOut)
            );
        }
        else
        {
            // Bounce back to original position
            await card.ScaleTo(1.1, 100);
            await Task.WhenAll(
                card.ScaleTo(1.0, 200, Easing.BounceOut),
                card.FadeTo(1.0, 150),
                card.TranslateTo(0, 0, 200, Easing.CubicOut)
            );
        }
    }
}
```

#### 7.1.2 Completion Particle Effect
```csharp
public class ParticleEffectService
{
    public async Task PlayCompletionEffect(View targetView)
    {
        var particles = CreateParticles(20); // Create 20 particles
        
        foreach (var particle in particles)
        {
            // Random direction and speed
            var angle = Random.Shared.NextDouble() * Math.PI * 2;
            var speed = Random.Shared.Next(50, 150);
            
            var endX = Math.Cos(angle) * speed;
            var endY = Math.Sin(angle) * speed;
            
            // Animate particle
            var animation = new Animation();
            animation.WithConcurrent((d) => particle.TranslationX = endX * d, 0, 1);
            animation.WithConcurrent((d) => particle.TranslationY = endY * d, 0, 1);
            animation.WithConcurrent((d) => particle.Opacity = 1 - d, 0, 1);
            
            animation.Commit(particle, "ParticleAnimation", 16, 1000, Easing.CubicOut,
                (d, isAborted) => RemoveParticle(particle));
        }
    }
}
```

### 7.2 Localization Implementation

#### 7.2.1 Resource Files Structure
```
Resources/
├── Strings/
│   ├── AppResources.resx (default - English)
│   ├── AppResources.es.resx (Spanish)
│   ├── AppResources.fr.resx (French)
│   ├── AppResources.de.resx (German)
│   └── AppResources.pt.resx (Portuguese)
```

#### 7.2.2 String Keys
```xml
<!-- AppResources.resx -->
<data name="App_Title" xml:space="preserve">
  <value>Task Manager</value>
</data>
<data name="Calendar_Title" xml:space="preserve">
  <value>Calendar</value>
</data>
<data name="Board_ColumnTodo" xml:space="preserve">
  <value>TODO</value>
</data>
<data name="Board_ColumnDoing" xml:space="preserve">
  <value>Doing</value>
</data>
<data name="Board_ColumnDone" xml:space="preserve">
  <value>Done</value>
</data>
<data name="Card_AddNew" xml:space="preserve">
  <value>Add Card</value>
</data>
<data name="Settings_Title" xml:space="preserve">
  <value>Settings</value>
</data>
<!-- ... more strings -->
```

#### 7.2.3 Usage in XAML
```xml
<Label Text="{x:Static resources:AppResources.Board_ColumnTodo}" />
```

#### 7.2.4 Usage in C#
```csharp
string title = AppResources.App_Title;
```

### 7.3 Hyperlink Detection & Handling

```csharp
public class HyperlinkHelper
{
    private static readonly Regex UrlRegex = new Regex(
        @"https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&/=]*)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled
    );
    
    public static FormattedString CreateFormattedTextWithLinks(string text)
    {
        var formattedString = new FormattedString();
        var matches = UrlRegex.Matches(text);
        
        if (matches.Count == 0)
        {
            formattedString.Spans.Add(new Span { Text = text });
            return formattedString;
        }
        
        int lastIndex = 0;
        
        foreach (Match match in matches)
        {
            // Add text before link
            if (match.Index > lastIndex)
            {
                formattedString.Spans.Add(new Span 
                { 
                    Text = text.Substring(lastIndex, match.Index - lastIndex) 
                });
            }
            
            // Add clickable link
            var linkSpan = new Span
            {
                Text = match.Value,
                TextColor = Colors.Blue,
                TextDecorations = TextDecorations.Underline
            };
            
            // Add gesture recognizer
            var tapGesture = new TapGestureRecognizer();
            tapGesture.Tapped += async (s, e) => 
            {
                await Launcher.OpenAsync(new Uri(match.Value));
            };
            
            formattedString.Spans.Add(linkSpan);
            
            lastIndex = match.Index + match.Length;
        }
        
        // Add remaining text
        if (lastIndex < text.Length)
        {
            formattedString.Spans.Add(new Span 
            { 
                Text = text.Substring(lastIndex) 
            });
        }
        
        return formattedString;
    }
}
```

### 7.4 Drag and Drop Platform Implementation

#### 7.4.1 MAUI Handler Approach
```csharp
// Custom handler for drag and drop
public class DraggableViewHandler : ViewHandler<DraggableView, PlatformView>
{
    protected override PlatformView CreatePlatformView()
    {
        #if __MACOS__
            return new MacOSDraggableView();
        #elif WINDOWS
            return new WindowsDraggableView();
        #endif
    }
    
    protected override void ConnectHandler(PlatformView platformView)
    {
        base.ConnectHandler(platformView);
        
        platformView.DragStarted += OnDragStarted;
        platformView.DragOver += OnDragOver;
        platformView.DragCompleted += OnDragCompleted;
    }
    
    // Event handlers
    private void OnDragStarted(object sender, DragEventArgs e)
    {
        VirtualView?.OnDragStarted();
    }
    
    // ... other handlers
}
```

#### 7.4.2 macOS-specific Implementation
```csharp
// Platform/MacCatalyst/MacOSDraggableView.cs
public class MacOSDraggableView : UIView
{
    private UIDragInteraction _dragInteraction;
    private UIDropInteraction _dropInteraction;
    
    public MacOSDraggableView()
    {
        SetupDragAndDrop();
    }
    
    private void SetupDragAndDrop()
    {
        _dragInteraction = new UIDragInteraction(this);
        AddInteraction(_dragInteraction);
        
        _dropInteraction = new UIDropInteraction(this);
        AddInteraction(_dropInteraction);
    }
    
    // Implement UIDragInteractionDelegate methods
    // Implement UIDropInteractionDelegate methods
}
```

#### 7.4.3 Windows-specific Implementation
```csharp
// Platform/Windows/WindowsDraggableView.cs
public class WindowsDraggableView : Microsoft.UI.Xaml.Controls.Grid
{
    public WindowsDraggableView()
    {
        SetupDragAndDrop();
    }
    
    private void SetupDragAndDrop()
    {
        AllowDrop = true;
        CanDrag = true;
        
        DragStarting += OnDragStarting;
        DragOver += OnDragOver;
        Drop += OnDrop;
    }
    
    private void OnDragStarting(UIElement sender, DragStartingEventArgs args)
    {
        // Handle drag start
    }
    
    private void OnDragOver(object sender, DragEventArgs e)
    {
        // Handle drag over
        e.AcceptedOperation = DataPackageOperation.Move;
    }
    
    private void OnDrop(object sender, DragEventArgs e)
    {
        // Handle drop
    }
}
```

---

## 8. Error Handling & Validation

### 8.1 Network Error Handling

```csharp
public class HolidayService
{
    private async Task<List<Holiday>> GetHolidaysWithRetry(
        string countryCode, 
        int maxRetries = 3)
    {
        int retryCount = 0;
        
        while (retryCount < maxRetries)
        {
            try
            {
                return await GetHolidaysAsync(countryCode);
            }
            catch (HttpRequestException ex)
            {
                retryCount++;
                
                if (retryCount >= maxRetries)
                {
                    // Log error and show user-friendly message
                    await ShowErrorDialog(
                        "Network Error",
                        "Unable to fetch holidays. Please check your internet connection."
                    );
                    return new List<Holiday>();
                }
                
                // Exponential backoff
                await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, retryCount)));
            }
        }
        
        return new List<Holiday>();
    }
}
```

### 8.2 Data Validation

```csharp
public class DataValidator
{
    public ValidationResult ValidateCard(Card card)
    {
        var result = new ValidationResult { IsValid = true };
        
        if (string.IsNullOrWhiteSpace(card.Title))
        {
            result.IsValid = false;
            result.Errors.Add("Title cannot be empty");
        }
        
        if (card.Title.Length > 200)
        {
            result.IsValid = false;
            result.Errors.Add("Title cannot exceed 200 characters");
        }
        
        if (card.Description.Length > 5000)
        {
            result.IsValid = false;
            result.Errors.Add("Description cannot exceed 5000 characters");
        }
        
        return result;
    }
    
    public ValidationResult ValidateColumn(Column column)
    {
        var result = new ValidationResult { IsValid = true };
        
        if (string.IsNullOrWhiteSpace(column.Name))
        {
            result.IsValid = false;
            result.Errors.Add("Column name cannot be empty");
        }
        
        return result;
    }
}

public class ValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new List<string>();
}
```

### 8.3 File System Error Handling

```csharp
public class DataService
{
    private async Task<T> SafeLoadAsync<T>(string filePath, Func<T> defaultFactory)
    {
        try
        {
            if (!File.Exists(filePath))
            {
                return defaultFactory();
            }
            
            string json = await File.ReadAllTextAsync(filePath);
            return JsonSerializer.Deserialize<T>(json);
        }
        catch (IOException ex)
        {
            Logger.LogError($"File IO error: {ex.Message}");
            await ShowErrorDialog("File Error", "Unable to read data file.");
            return defaultFactory();
        }
        catch (JsonException ex)
        {
            Logger.LogError($"JSON parsing error: {ex.Message}");
            await ShowErrorDialog(
                "Data Error", 
                "Data file is corrupted. Creating new file."
            );
            return defaultFactory();
        }
    }
    
    private async Task SafeSaveAsync<T>(string filePath, T data)
    {
        try
        {
            string json = JsonSerializer.Serialize(data, new JsonSerializerOptions 
            { 
                WriteIndented = true 
            });
            
            // Write to temp file first
            string tempPath = filePath + ".tmp";
            await File.WriteAllTextAsync(tempPath, json);
            
            // Replace original file
            File.Move(tempPath, filePath, overwrite: true);
        }
        catch (Exception ex)
        {
            Logger.LogError($"Save error: {ex.Message}");
            await ShowErrorDialog("Save Error", "Unable to save data.");
            throw;
        }
    }
}
```

---

## 9. Performance Considerations

### 9.1 Optimization Strategies

#### 9.1.1 Lazy Loading
- Load only current month's data on startup
- Load adjacent months in background
- Lazy load dashboard statistics

#### 9.1.2 Virtual Scrolling
- Use CollectionView with virtualization for large card lists
- Render only visible cards in viewport

#### 9.1.3 Caching
- Cache frequently accessed data in memory
- Cache holiday data locally
- Cache rendered dashboard charts

#### 9.1.4 Background Processing
- Load dashboard statistics in background thread
- Process holiday API calls asynchronously
- Use Task.Run for heavy computations

```csharp
public class DashboardViewModel
{
    private async Task LoadDashboardDataAsync()
    {
        IsLoading = true;
        
        // Load data in background
        var dashboardData = await Task.Run(async () =>
        {
            var cards = await _dataService.GetAllCardsInRangeAsync(
                StartDate, 
                EndDate
            );
            
            return CalculateStatistics(cards);
        });
        
        // Update UI on main thread
        MainThread.BeginInvokeOnMainThread(() =>
        {
            DashboardData = dashboardData;
            IsLoading = false;
        });
    }
}
```

### 9.2 Memory Management

```csharp
// Dispose of resources properly
public class BoardViewModel : IDisposable
{
    private CancellationTokenSource _cts;
    
    public void Dispose()
    {
        _cts?.Cancel();
        _cts?.Dispose();
    }
}

// Weak event handlers to prevent memory leaks
public class CardView
{
    private readonly WeakEventManager _eventManager = new WeakEventManager();
    
    public event EventHandler CardMoved
    {
        add => _eventManager.AddEventHandler(value);
        remove => _eventManager.RemoveEventHandler(value);
    }
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

Test coverage for:
- Data models and validation
- Business logic in services
- Date calculations (next work day, etc.)
- Time tracking calculations
- JSON serialization/deserialization

```csharp
[Test]
public void GetNextWorkDay_SkipsWeekend()
{
    // Arrange
    var friday = new DateTime(2026, 1, 16); // Friday
    var settings = GetDefaultSettings();
    var service = new WorkDayService();
    
    // Act
    var nextWorkDay = service.GetNextWorkDay(friday, settings);
    
    // Assert
    Assert.AreEqual(DayOfWeek.Monday, nextWorkDay.DayOfWeek);
    Assert.AreEqual(new DateTime(2026, 1, 19), nextWorkDay);
}

[Test]
public void GetTimeInColumn_CalculatesCorrectly()
{
    // Arrange
    var card = CreateTestCard();
    var service = new TimeTrackingService();
    
    // Act
    var timeInDoing = service.GetTimeInColumn(card, "doing");
    
    // Assert
    Assert.AreEqual(TimeSpan.FromHours(5.5), timeInDoing);
}
```

### 10.2 Integration Tests

Test coverage for:
- Data service read/write operations
- Holiday API integration
- Export/import functionality
- Cross-platform file system access

### 10.3 UI Tests

Test coverage for:
- Drag and drop functionality
- Navigation between views
- Card creation and editing
- Settings modifications

```csharp
[Test]
public async Task DragCard_ToNextColumn_UpdatesCardPosition()
{
    // Arrange
    var cardView = GetCardView();
    var todoColumn = GetColumn("TODO");
    var doingColumn = GetColumn("Doing");
    
    // Act
    await cardView.SimulateDrag(todoColumn, doingColumn);
    
    // Assert
    Assert.AreEqual("Doing", cardView.Card.ColumnId);
    Assert.IsTrue(cardView.Card.MovementHistory.Any());
}
```

### 10.4 Platform-Specific Testing

- Test on macOS (multiple versions)
- Test on Windows 10 and Windows 11
- Test different screen resolutions
- Test with different system themes

---

## 11. Security Considerations

### 11.1 Data Security

- All data stored locally on user's machine
- No cloud synchronization (privacy-focused)
- No telemetry or analytics collection
- User data never leaves their device

### 11.2 File System Security

```csharp
public class SecureDataService
{
    private string GetSecureDataPath()
    {
        // Use platform-appropriate secure storage locations
        var dataPath = Path.Combine(
            Environment.GetFolderPath(
                Environment.SpecialFolder.ApplicationData,
                Environment.SpecialFolderOption.Create
            ),
            "TaskManager"
        );
        
        // Ensure directory exists with appropriate permissions
        Directory.CreateDirectory(dataPath);
        
        return dataPath;
    }
    
    private void ValidateFilePath(string path)
    {
        // Prevent path traversal attacks
        var fullPath = Path.GetFullPath(path);
        var dataPath = GetSecureDataPath();
        
        if (!fullPath.StartsWith(dataPath))
        {
            throw new SecurityException("Invalid file path");
        }
    }
}
```

### 11.3 Input Validation

```csharp
public class InputValidator
{
    // Sanitize user input to prevent XSS-like issues in hyperlinks
    public string SanitizeUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return string.Empty;
            
        // Only allow http and https protocols
        if (!url.StartsWith("http://") && !url.StartsWith("https://"))
            return string.Empty;
            
        return url;
    }
    
    // Validate template prefix
    public string SanitizePrefix(string prefix)
    {
        // Limit length and remove potentially problematic characters
        if (string.IsNullOrWhiteSpace(prefix))
            return string.Empty;
            
        prefix = prefix.Trim();
        
        if (prefix.Length > 20)
            prefix = prefix.Substring(0, 20);
            
        return prefix;
    }
}
```

---

## 12. Deployment & Distribution

### 12.1 Build Configuration

#### 12.1.1 macOS Build
```xml
<!-- TaskManager.csproj -->
<PropertyGroup Condition="$(TargetFramework.Contains('-maccatalyst'))">
  <RuntimeIdentifier>maccatalyst-x64</RuntimeIdentifier>
  <RuntimeIdentifier>maccatalyst-arm64</RuntimeIdentifier>
  <CodesignKey>Developer ID Application</CodesignKey>
  <CodesignProvision>Automatic</CodesignProvision>
  <EnableCodeSigning>true</EnableCodeSigning>
</PropertyGroup>
```

**Build Command:**
```bash
dotnet publish -f net8.0-maccatalyst -c Release
```

#### 12.1.2 Windows Build
```xml
<PropertyGroup Condition="$(TargetFramework.Contains('-windows'))">
  <RuntimeIdentifier>win-x64</RuntimeIdentifier>
  <RuntimeIdentifier>win-arm64</RuntimeIdentifier>
  <SelfContained>true</SelfContained>
  <PublishSingleFile>true</PublishSingleFile>
</PropertyGroup>
```

**Build Command:**
```bash
dotnet publish -f net8.0-windows10.0.19041.0 -c Release
```

### 12.2 Distribution

#### 12.2.1 macOS Distribution
- Create DMG installer
- Sign application with Developer ID certificate
- Notarize with Apple
- Distribute via website or Mac App Store

#### 12.2.2 Windows Distribution
- Create MSI installer using WiX Toolset
- Sign with code signing certificate
- Distribute via website or Microsoft Store

### 12.3 Version Management

```csharp
public class AppVersion
{
    public const string Version = "1.0.0";
    public const string BuildNumber = "1";
    
    public static string GetFullVersion()
    {
        return $"{Version}.{BuildNumber}";
    }
}
```

---

## 13. Future Enhancements (Not in v1.0)

### 13.1 Potential Features
- Cloud sync (optional)
- Team collaboration features
- Mobile companion app
- Calendar integration (Google Calendar, Outlook)
- Pomodoro timer integration
- Recurring tasks
- Task dependencies
- Subtasks
- File attachments
- Voice notes
- AI-powered task suggestions
- Customizable keyboard shortcuts
- Plugin/extension system

### 13.2 Technical Debt to Address
- Consider migrating to SQLite for better query performance
- Implement differential sync for large data sets
- Add automated backup system
- Implement undo/redo functionality
- Add accessibility features (screen reader support)

---

## 14. Development Timeline Estimate

### Phase 1: Core Infrastructure (3-4 weeks)
- Project setup and architecture
- Data models and services
- Basic MVVM structure
- File system operations

### Phase 2: Calendar & Board View (3-4 weeks)
- Calendar UI implementation
- Board view with columns
- Basic card management
- Drag and drop foundation

### Phase 3: Advanced Features (3-4 weeks)
- Time tracking system
- Template and tag management
- Holiday API integration
- Work day configuration

### Phase 4: Dashboard & Analytics (2-3 weeks)
- Dashboard UI
- Chart implementations
- Statistics calculations
- Time range filtering

### Phase 5: Polish & Animations (2 weeks)
- Smooth animations
- Particle effects
- Transitions
- UI refinements

### Phase 6: Settings & Data Management (2 weeks)
- Settings UI
- Export/import functionality
- Data validation
- Error handling

### Phase 7: Testing & Bug Fixes (2-3 weeks)
- Unit testing
- Integration testing
- Platform-specific testing
- Bug fixes

### Phase 8: Localization & Documentation (1-2 weeks)
- Resource files
- Translations
- User documentation
- Developer documentation

**Total Estimated Time: 18-24 weeks**

---

## 15. Glossary

| Term | Definition |
|------|------------|
| **Board** | The Kanban-style view showing columns and cards for a specific day |
| **Card** | Individual task item that can be moved between columns |
| **Column** | Vertical section on the board representing a task state |
| **Static Column** | TODO, Doing, or Done columns that cannot be deleted |
| **Custom Column** | User-created column that can be modified or deleted |
| **Template** | Predefined card configuration with prefix and styling |
| **Tag** | Label that can be assigned to cards for organization |
| **Work Day** | Day designated as a working day in user's schedule |
| **Holiday** | Non-working day fetched from API or manually added |
| **Movement History** | Record of when a card was moved between columns |
| **Nerd Stats** | Detailed time tracking analytics for a card |
| **Dashboard** | Analytics view showing task statistics and trends |

---

## 16. References & Resources

### 16.1 Documentation
- [.NET MAUI Documentation](https://docs.microsoft.com/dotnet/maui/)
- [OpenHolidaysAPI Documentation](https://www.openholidaysapi.org/en/)
- [MAUI Community Toolkit](https://docs.microsoft.com/dotnet/communitytoolkit/maui/)

### 16.2 Design Resources
- [Material Design Guidelines](https://material.io/design)
- [macOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/macos)
- [Windows Design Guidelines](https://docs.microsoft.com/windows/apps/design/)

### 16.3 Libraries & Tools
- **SkiaSharp:** https://github.com/mono/SkiaSharp
- **Syncfusion Charts:** https://www.syncfusion.com/maui-controls
- **CommunityToolkit.Maui:** https://github.com/CommunityToolkit/Maui

---

## Appendix A: API Endpoints Reference

### OpenHolidaysAPI Endpoints

1. **Get All Countries**
   ```
   GET https://openholidaysapi.org/Countries
   Headers: Accept: application/json
   
   Response:
   [
     {
       "isoCode": "US",
       "name": [
         { "language": "EN", "text": "United States" }
       ],
       "officialLanguages": ["EN"]
     }
   ]
   ```

2. **Get Public Holidays**
   ```
   GET https://openholidaysapi.org/PublicHolidays
   Parameters:
     - countryIsoCode: string (required)
     - languageIsoCode: string (optional)
     - validFrom: date (required, YYYY-MM-DD)
     - validTo: date (required, YYYY-MM-DD)
   
   Response:
   [
     {
       "id": "uuid",
       "startDate": "2026-01-01",
       "endDate": "2026-01-01",
       "type": "Public",
       "name": [
         { "language": "EN", "text": "New Year's Day" }
       ],
       "nationwide": true,
       "subdivisions": []
     }
   ]
   ```

---

## Appendix B: File Format Examples

### Example: Monthly Board JSON
See Section 5.2.1 for complete structure

### Example: Settings JSON
See Section 5.2.2 for complete structure

### Example: Templates JSON
See Section 5.2.3 for complete structure

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-28 | Development Team | Initial technical specification |

---

**End of Technical Specification Document**
