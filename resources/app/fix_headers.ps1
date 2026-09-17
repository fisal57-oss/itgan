$path = "d:\برامجي\انجاز\index.html"
$content = Get-Content $path -Raw

# 1. Cleanup all logo containers first (to start from a clean state)
# We look for the specific injected blocks
$pattern = '(?s)\s*<div class="header-center dynamic-print-logo-container".*?<!-- Logo injected by JS -->\s*</div>'
$content = [regex]::Replace($content, $pattern, "")

# Extra cleanup for the ones with "Logo will be injected here"
$pattern2 = '(?s)\s*<div class="header-center dynamic-print-logo-container".*?<!-- Logo will be injected here -->\s*</div>'
$content = [regex]::Replace($content, $pattern2, "")

# 2. Fix Template 1 (Booking Request)
# It likely has the flex-style already, but might have missing logo slot due to cleanup
$t1_old = '(?s)<div id="booking-request-print-template".*?<div class="official-print-header".*?<div class="header-right".*?</div>\s*<div class="header-left".*?</div>\s*</div>'
$t1_new = '<div id="booking-request-print-template" class="print-template" style="display: none;">
        <div class="official-print-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
            <div class="header-right" style="width: 33%;">
                المملكة العربية السعودية<br>
                وزارة التعليم<br>
                <span class="dynamic-org-name">الإدارة العامة للتعليم بمنطقة عسير</span><br>
                <span class="dynamic-dept-name">قسم الاتصال المؤسسي</span>
            </div>
            <div class="header-center dynamic-print-logo-container" style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center;">
                <!-- Logo injected by JS -->
            </div>
            <div class="header-left" style="width: 33%;">
            </div>
        </div>'
$content = [regex]::Replace($content, $t1_old, $t1_new)

# 3. Fix Template 2 (All Bookings)
$t2_old = '(?s)<div id="all-bookings-print-template".*?<div class="official-print-header".*?<div class="header-right".*?</div>\s*<div class="header-left">.*?<svg.*?</svg>\s*</div>\s*</div>'
$t2_new = '<div id="all-bookings-print-template" class="print-template" style="display: none;">
        <div class="official-print-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px;">
            <div class="header-right" style="width: 33%;">
                المملكة العربية السعودية<br>
                وزارة التعليم<br>
                <span class="dynamic-org-name">إدارة التعليم بمنطقة عسير</span><br>
                <span class="dynamic-dept-name">قسم الاتصال المؤسسي</span>
            </div>
            <div class="header-center dynamic-print-logo-container" style="width: 90px; height: 90px; display: flex; align-items: center; justify-content: center;">
                <!-- Logo injected by JS -->
            </div>
            <div class="header-left" style="width: 33%;">
            </div>
        </div>'
$content = [regex]::Replace($content, $t2_old, $t2_new)

# 4. Fix Template 3 (Calendar)
$t3_old = '(?s)<div id="calendar-print-template".*?<div class="official-print-header".*?<div class="header-right".*?</div>\s*<div class="header-left">.*?<svg.*?</svg>\s*</div>\s*</div>'
$t3_new = '<div id="calendar-print-template" class="print-template" style="display: none;">
        <div class="official-print-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
            <div class="header-right" style="width: 33%;">
                المملكة العربية السعودية<br>
                وزارة التعليم<br>
                <span class="dynamic-org-name">الإدارة العامة للتعليم بمنطقة عسير</span><br>
                <span class="dynamic-dept-name">قسم الاتصال المؤسسي</span>
            </div>
            <div class="header-center dynamic-print-logo-container" style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                <!-- Logo injected by JS -->
            </div>
            <div class="header-left" style="width: 33%;">
            </div>
        </div>'
$content = [regex]::Replace($content, $t3_old, $t3_new)

Set-Content $path $content -Encoding utf8
Write-Output "Headers fixed."
