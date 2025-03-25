const fs = require('fs');
const path = require('path');

// 삭제할 파일 목록
const filesToDelete = [
  'app_origin.tsx',
  'app_original.tsx',
  'app_original_backup.tsx'
];

// 파일 삭제 함수
const deleteFiles = () => {
  filesToDelete.forEach(file => {
    const filePath = path.join(__dirname, 'pages', file);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`파일 삭제 성공: ${file}`);
      } else {
        console.log(`파일이 존재하지 않음: ${file}`);
      }
    } catch (error) {
      console.error(`파일 삭제 중 오류 발생 (${file}):`, error);
    }
  });
};

// 파일 삭제 실행
deleteFiles();
