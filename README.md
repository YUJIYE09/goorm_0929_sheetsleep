# 교대잠

교대근무 일정에 맞춰 수면 시간, 낮잠, 카페인 중단, 퇴근길 빛 관리 계획을 제안하는 로컬 저장형 Expo 앱입니다.

## 시작하기

Node.js 22.13 이상에서 의존성을 설치한 뒤 Expo 개발 서버를 실행합니다.

```sh
npm install
npx expo start
```

알림과 백그라운드 오디오를 기기에서 확인하려면 Expo Go 대신 iOS·Android 개발 빌드를 사용하세요.

## 주요 경로

- `app/(tabs)/index.tsx`: 오늘 플랜과 다음 일정
- `app/(tabs)/schedule.tsx`: 월간 근무표와 8일 패턴 반복 입력
- `app/(tabs)/sound.tsx`: 2종 사운드, 반복 재생, 타이머 페이드아웃
- `app/(tabs)/log.tsx`: 수면 체크인과 최근 7일 기록
- `app/settings.tsx`: 근무 시간, 플랜 기본값, 알림, JSON 내보내기·삭제
- `src/engine/planner.ts`: 결정적인 로컬 플랜 계산
- `src/store/useAppStore.ts`: 기기 내 Zustand/AsyncStorage 저장

## 참고

플랜 규칙은 일반 수면 습관 안내이며 의료 진단이나 치료를 제공하지 않습니다. 일정 결과는 일반 권고를 단순화한 것으로, 교대 유형·근무표·개인 설정에 따라 조정해 주세요.
