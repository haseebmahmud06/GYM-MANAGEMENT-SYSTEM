import re
import os

files_to_fix = {
    'src/pages/dashboard/admin/AnalyticsPage.tsx': ['motion', 'Calendar'],
    'src/pages/dashboard/admin/AttendancePage.tsx': ['Clock'],
    'src/pages/dashboard/admin/BookingsPage.tsx': ['CardTitle', 'CardDescription'],
    'src/pages/dashboard/admin/DashboardPage.tsx': ['Dumbbell'],
    'src/pages/dashboard/admin/NotificationsPage.tsx': ['CardHeader', 'CardTitle', 'CardDescription'],
    'src/pages/dashboard/admin/PackagesPage.tsx': ['Percent'],
    'src/pages/dashboard/admin/PaymentsPage.tsx': ['formatTime'],
    'src/pages/dashboard/admin/ProfilePage.tsx': ['motion', 'MapPin'],
    'src/pages/dashboard/admin/SettingsPage.tsx': ['Badge', 'Shield', 'Sliders'],
    'src/pages/dashboard/admin/TrainersPage.tsx': ['CardHeader', 'CardTitle', 'CardDescription'],
    'src/pages/dashboard/member/MemberBookingsPage.tsx': ['Clock'],
    'src/pages/dashboard/member/MemberDashboardPage.tsx': ['motion', 'Package', 'AlertTriangle'],
    'src/pages/dashboard/member/MemberPackagesPage.tsx': ['useState']
}

for filepath, vars in files_to_fix.items():
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for var in vars:
        content = re.sub(rf'\b{var}\s*,\s*', '', content)
        content = re.sub(rf',\s*{var}\b', '', content)
        content = re.sub(rf'\{{\s*{var}\s*\}}', '{}', content)
        content = re.sub(rf'import\s+{{\s*}}\s+from\s+[\'\"].+?[\'\"];?\n', '', content)
        content = re.sub(rf'import\s+{var}\s+from\s+[\'\"].+?[\'\"];?\n', '', content)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
print('Fixed unused imports')
