# 🔄 Safe Project Rename Guide: StreetStyleCentral → LOST&FOUND

## ⚠️ Important Notes
- **Backup First**: Always backup your project before renaming
- **Close All Applications**: Close VS Code, terminal, and any running processes
- **Test After Rename**: Run the project to ensure everything works

## 📋 Step-by-Step Rename Process

### 1. **Stop All Running Processes**
```bash
# Stop any running development servers
# Close VS Code and all terminals
# Ensure no processes are using the project folder
```

### 2. **Update Project References**
Before renaming the folder, update these files:

#### A. Update `presentation.md`
```markdown
# LOST&FOUND - Plateforme E-commerce de Mode Urbaine
- **Titre du projet**: LOST&FOUND - Plateforme E-commerce de Mode Urbaine
- LOST&FOUND - Marque de mode urbaine
```

#### B. Update `db/seed.ts`
```typescript
// Change line 213 from:
email: "admin@streetstylecentral.com",
// To:
email: "admin@lostandfound.com",
```

### 3. **Rename the Project Folder**
```bash
# Navigate to the parent directory
cd C:\Users\4B\Downloads\Private\LST SITD\

# Rename the folder
Rename-Item "StreetStyleCentral" "LOST&FOUND"
```

### 4. **Update Workspace Path**
After renaming, update your workspace path:
- Open VS Code
- File → Open Folder → Select the new `LOST&FOUND` folder
- Update any workspace settings if needed

### 5. **Verify Configuration Files**
Check that these files still work correctly:
- `package.json` ✅ (uses relative paths)
- `vite.config.ts` ✅ (uses relative paths)
- `tsconfig.json` ✅ (uses relative paths)
- `drizzle.config.ts` ✅ (uses relative paths)

### 6. **Test the Project**
```bash
# Navigate to the new folder
cd "C:\Users\4B\Downloads\Private\LST SITD\LOST&FOUND"

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

## 🔍 What Could Cause Issues

### ❌ **Potential Problem Areas**
1. **Hardcoded Paths**: Any absolute paths in the code
2. **Environment Variables**: Paths in .env files
3. **IDE Settings**: VS Code workspace settings
4. **Git Configuration**: Remote repository URLs
5. **Database Connections**: If using absolute paths

### ✅ **Safe Areas (No Issues Expected)**
1. **Relative Paths**: All config files use relative paths
2. **Package.json**: No hardcoded folder references
3. **Vite Config**: Uses `__dirname` for dynamic paths
4. **TypeScript Config**: Uses relative path mappings
5. **Database Schema**: No folder-specific references

## 🛠️ Troubleshooting

### If You Get Errors After Rename:

#### 1. **Module Resolution Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

#### 2. **Path Resolution Issues**
```bash
# Check if any absolute paths exist
grep -r "StreetStyleCentral" .
grep -r "C:\\Users\\4B\\Downloads\\Private\\LST SITD\\StreetStyleCentral" .
```

#### 3. **VS Code Issues**
- Close VS Code completely
- Reopen the new folder
- Reload the window (Ctrl+Shift+P → "Developer: Reload Window")

#### 4. **Database Connection Issues**
- Check if database credentials are correct
- Ensure MySQL is running
- Test connection with: `npm run db:push`

## 📁 Files That Need Updates

### Files to Update Before Rename:
1. `presentation.md` - Update project name references
2. `db/seed.ts` - Update email domain
3. Any documentation files with old name

### Files That Are Safe (No Changes Needed):
1. `package.json` - Uses relative paths
2. `vite.config.ts` - Uses dynamic paths
3. `tsconfig.json` - Uses relative paths
4. `drizzle.config.ts` - Uses relative paths
5. All source code files - No hardcoded paths

## 🚀 After Successful Rename

### 1. **Update Git Remote (if needed)**
```bash
# Check current remote
git remote -v

# Update if needed (usually not required)
git remote set-url origin https://github.com/KamalAassab/Lost-and-Found.git
```

### 2. **Update Documentation**
- Update README.md with new project name
- Update any deployment configurations
- Update environment variable documentation

### 3. **Test Everything**
```bash
# Test development server
npm run dev

# Test build process
npm run build

# Test database operations
npm run db:push
npm run db:seed
```

## ✅ Success Checklist

- [ ] Project folder renamed successfully
- [ ] VS Code opens the new folder
- [ ] `npm run dev` works without errors
- [ ] `npm run build` completes successfully
- [ ] Database connections work
- [ ] All pages load correctly
- [ ] No console errors
- [ ] Git operations work normally

## 🆘 If Something Goes Wrong

### Quick Recovery:
1. **Rename back to original**: `Rename-Item "LOST&FOUND" "StreetStyleCentral"`
2. **Restore from backup**: If you have a backup
3. **Check git status**: `git status` to see if any files changed
4. **Reset if needed**: `git reset --hard HEAD` to restore files

## 💡 Pro Tips

1. **Use relative paths**: Always use relative paths in configuration
2. **Test incrementally**: Test after each step
3. **Keep backups**: Always backup before major changes
4. **Check git status**: Ensure no unexpected changes
5. **Update documentation**: Keep docs in sync with changes

---

**Remember**: The key to a successful rename is ensuring all paths are relative and no hardcoded references exist in the codebase.
