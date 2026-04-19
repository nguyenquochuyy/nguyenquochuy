const fs = require('fs');
const path = require('path');

const files = [
    'components/admin/ProductManager.tsx',
    'components/admin/CategoryManager.tsx',
    'components/admin/FinanceManager.tsx',
    'components/admin/InventoryManager.tsx',
    'components/admin/CustomerManager.tsx',
    'components/admin/VoucherManager.tsx',
    'components/admin/SettingsManager.tsx',
    'components/admin/StaffManager.tsx',
    'components/admin/OrderManager.tsx',
    'components/admin/DashboardStats.tsx',
    'services/translations.ts'
];

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${file}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Remove excessive blank lines (more than 1 consecutive blank line)
    const cleanedLines = [];
    let blankCount = 0;
    
    lines.forEach(line => {
        if (line.trim() === '') {
            blankCount++;
            if (blankCount <= 1) {
                cleanedLines.push(line);
            }
        } else {
            blankCount = 0;
            cleanedLines.push(line);
        }
    });
    
    const cleanedContent = cleanedLines.join('\n');
    fs.writeFileSync(filePath, cleanedContent);
    console.log(`Cleaned: ${file}`);
});

console.log('Done!');
