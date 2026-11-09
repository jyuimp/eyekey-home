EyeKey 펌웨어 웹 업데이트 자산 (홈페이지 배포용)
===============================================
이 폴더는 홈페이지 `#flash`(업데이트) 페이지가 same-origin으로 로드하는 파일입니다.
사용자는 Python/개발환경 없이 배포된 홈페이지(HTTPS, Chrome/Edge)에서 USB 업데이트할 수 있습니다.

구조
- targets.json            : C3/C6 선택 메타
- c3/, c6/                : eyekey_app.bin, eyekey_factory.bin, manifest.json, SHA256SUMS

갱신 방법 (펌웨어 릴리스 후, 메인 EyeKey 저장소에서)
1) EyeKey_xiao_esp32_fw에서 릴리스 생성:
   .\tools\make-release.ps1 -Target c3 -BuildDir build-verify-c3 -Version <ver>
   .\tools\make-release.ps1 -Target c6 -BuildDir build-verify-c6 -Version <ver>
2) 배포 폴더 갱신:
   .\tools\publish-deploy.ps1 -C3 dist\<ver>-c3 -C6 dist\<ver>-c6
3) 생성된 deploy/의 targets.json, c3/*, c6/*(index.html 제외)를
   이 폴더(EyeKey_Homepage/downloads/firmware/)에 복사.
4) EyeKey_Homepage 저장소에서 커밋/푸시 → Vercel 배포.

주의
- Web Serial: HTTPS/localhost, 데스크톱 Chrome/Edge. iOS Safari 미지원.
- C6 런타임 실기 검증은 보류(C3 중심)일 수 있음. targets/manifest 버전 확인.
- 펌웨어 바이너리는 용량이 있으므로 변경 릴리스 단위로만 갱신.
