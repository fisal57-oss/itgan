import os
import re

file_path = r'd:\برامجي\انجاز\index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Template 1: Booking Request Header
t1_old = r'<div class="official-print-header">\s*<div class="header-right">\s*المملكة العربية السعودية<br>\s*وزارة التعليم<br>\s*الإدارة العامة للتعليم بمنطقة عسير<br>\s*قسم الاتصال المؤسسي\s*</div>\s*<div class="header-left">\s*</div>\s*</div>'
t1_new = '''<div class="official-print-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
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
        </div>'''

# Template 2: All Bookings Header (Includes SVG)
t2_old = r'<div class="official-print-header">\s*<div class="header-right">\s*المملكة العربية السعودية<br>\s*وزارة التعليم<br>\s*الإدارة العامة للتعليم بمنطقة عسير<br>\s*قسم الاتصال المؤسسي\s*</div>\s*<div class="header-left">.*?<!-- Embedded Official MOE Logo SVG -->.*?<svg.*?>.*?</svg>\s*</div>\s*</div>'
t2_new = '''<div class="official-print-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px;">
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
        </div>'''

# Apply Template 1 (Specific to the one with empty header-left)
# We find all occurrences and check content
content = re.sub(t1_old, t1_new, content, flags=re.DOTALL)

# Apply Template 2/3 (Specific to the ones with SVG)
content = re.sub(t2_old, t2_new, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Branding templates updated successfully via script.")
