const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'components');

const moves = [
  // layout
  { f: 'Layout.tsx', t: 'layout/Layout.tsx' },
  { f: 'Header.tsx', t: 'layout/Header.tsx' },
  { f: 'PrivateRoute.tsx', t: 'layout/PrivateRoute.tsx' },
  { f: 'RoleIf.tsx', t: 'layout/RoleIf.tsx' },
  { f: 'Sidebar.tsx', t: 'layout/Sidebar.tsx' },
  { f: 'ThemeToggle.tsx', t: 'layout/ThemeToggle.tsx' },
  { f: 'UserCard.tsx', t: 'layout/UserCard.tsx' },
  // global
  { f: 'ConfirmModal.tsx', t: 'global/ConfirmModal.tsx' },
  { f: 'DataRangeFilter.tsx', t: 'global/DataRangeFilter.tsx' },
  { f: 'ImportModal.tsx', t: 'global/ImportModal.tsx' },
  { f: 'InputWithIcon.tsx', t: 'global/InputWithIcon.tsx' },
  { f: 'JarvisButton.tsx', t: 'global/JarvisButton.tsx' },
  { f: 'ScopeLogo.tsx', t: 'global/ScopeLogo.tsx' },
  { f: 'UniversalDrawer.tsx', t: 'global/UniversalDrawer.tsx' },
  // validation
  { f: 'ValidationSucessModal.tsx', t: 'validation/ValidationSucessModal.tsx' },
  { f: 'EmptyValidationStatus.tsx', t: 'validation/EmptyValidationStatus.tsx' },
  // schedule
  { f: 'ScheduleAutocomplete.tsx', t: 'schedule/ScheduleAutocomplete.tsx' },
  { f: 'ColumnMappingPanel.tsx', t: 'schedule/ColumnMappingPanel.tsx' }
];

function updateImports(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  moves.forEach(move => {
    const name = move.f.replace('.tsx', '');
    const toFolder = path.dirname(move.t);
    
    // 1. replace imports matching components/Name
    // const pattern = new RegExp(`(['"])(.*?components)/(${name})(['"])`, 'g');
    const pattern = new RegExp(`(['"])(.*?components)\\/` + name + `(['"])`, 'g');
    newContent = newContent.replace(pattern, `$1$2/${toFolder}/${name}$3`);
    
    // 2. replace imports matching ./Name if we are right inside components dir
    if (path.dirname(filePath) === componentsDir) {
      const patternCurrentDir = new RegExp(`(['"])\\.\\/` + name + `(['"])`, 'g');
      newContent = newContent.replace(patternCurrentDir, `$1./${toFolder}/${name}$2`);
    } else {
      // 3. if we are in components/someFolder, they might import ../Name
      if (filePath.startsWith(componentsDir) && path.dirname(filePath) !== componentsDir) {
        const patternParent = new RegExp(`(['"])\\.\\.\\/` + name + `(['"])`, 'g');
        newContent = newContent.replace(patternParent, `$1../${toFolder}/${name}$2`);
      }
    }
  });

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log('Updated ' + filePath);
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        walk(filePath);
      }
    } else {
      updateImports(filePath);
    }
  });
}

// 1. Update imports first to avoid breaking logic if we need to search
walk(srcDir);

// 2. Move files
moves.forEach(m => {
  const src = path.join(componentsDir, m.f);
  const dest = path.join(componentsDir, m.t);
  if (fs.existsSync(src)) {
    // create dir if not exists
    if (!fs.existsSync(path.dirname(dest))) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
    }
    fs.renameSync(src, dest);
    console.log('Moved ' + m.f + ' to ' + m.t);
  } else {
    console.log('Not found: ' + m.f);
  }
});
console.log('Done');
