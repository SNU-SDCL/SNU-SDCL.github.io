# 연구실 홈페이지

서울대학교 화학부 자율실험실(self-driving lab) 홈페이지입니다.
빌드 도구 없이 HTML/CSS/JS 파일만으로 동작합니다. 전체 기능을 확인하려면 간단한 로컬 서버나 GitHub Pages를 사용하세요.
Publication 페이지는 브라우저 보안 정책상 `publications.json`을 불러오기 위해 서버 환경이 필요합니다.

```bash
python3 -m http.server 8000
```

실행 후 `http://localhost:8000`에서 확인할 수 있습니다.

## 파일 구조

```
index.html          메인 (히어로 · OUR RESEARCH · OUR NEWS · OUR GALLERY)
about.html          연락처 · 호실 안내 · 지도
members.html        교수 · 구성원 · 동문
research.html       연구 개요 + 주제 3개 상세 (플랫폼 · 알고리즘 · 소재 탐색)
publications.html   논문 목록 (연도 필터)
news.html           소식
gallery.html        사진 (클릭하면 크게 보기)
assets/style.css    디자인 전체 (색·글꼴·간격이 맨 위 :root 에 모여 있음)
assets/main.js      헤더·모바일메뉴·스크롤등장·라이트박스·논문필터
lab-website.html    이전 버전 (참고용, 사용 안 함)
```

## 수정하는 법

HTML 안에 **★** 표시가 붙은 주석 근처의 글자만 바꾸면 됩니다.

### 1. 색 바꾸기
`assets/style.css` 맨 위 `:root` 의 `--accent` 값 하나만 바꾸면 사이트 전체 강조색이 바뀝니다.

```css
--accent:#2B3FF3;   /* 예: #E5484D 레드 · #0F8B8D 청록 · #111111 모노 */
```

### 2. 사진 넣기
사진은 `images/` 폴더에 넣습니다 (인물은 `images/members/`).
아직 사진이 없는 자리는 그라디언트 placeholder(`<div class="ph ph--1"></div>`)로 채워져 있으니,
그 `div` 를 통째로 `img` 로 바꾸면 됩니다.

```html
<!-- 전 -->
<div class="ph ph--1"></div>
<!-- 후 -->
<img src="images/research/platform.jpg" alt="자율 실험 플랫폼">
```

인물 사진은 감싸는 `div` 를 지우지 말고 안쪽만 바꾸세요.

```html
<div class="person__photo"><img src="images/members/hong_gildong.jpg" alt="홍길동"></div>
```

크기·비율·hover 확대는 CSS가 알아서 처리하니 이미지 크기는 신경 쓰지 않아도 됩니다.
권장 비율 — 연구 카드 4:5, 갤러리 4:3, 인물 3:4, 연구 상세 5:4.

### 3. 히어로 배경을 사진으로
`assets/style.css` 의 `.hero__bg` 규칙에서 `background:` 한 줄을 바꾸면 됩니다.

```css
.hero__bg{ background:url("../assets/visual.jpg") center/cover no-repeat; }
```

### 4. 항목 추가
- 논문 → `publications.json`의 `publications` 배열에 항목을 추가합니다.
  Publication 페이지의 목록, 연도 필터, 검색 대상과 논문 수가 자동으로 갱신됩니다.
- 뉴스 → `news.html` 의 `<a class="news__row">` 블록을 복사 (최신순으로 위에).
- 구성원 → `members.html` 의 `<div class="person">` 블록을 복사.
- 사진 → `gallery.html` 의 `<div class="gitem">` 블록을 복사.
  `data-title` / `data-date` / `data-cap` 이 크게 보기 화면에 표시됩니다.

### 5. 메뉴·푸터 수정
메뉴와 푸터는 7개 HTML 파일에 각각 들어 있습니다.
바꿀 때는 에디터의 "전체 파일에서 바꾸기"로 7개를 한 번에 수정하세요.

### 6. 글자 강조
홈페이지 전체는 Pretendard 한 가지 글꼴을 사용합니다.
- 영문 강조 → `<em>영문</em>` (볼드)
- 한글 강조 → `<span class="kr-em">한글</span>` (볼드 + 강조색)

## 지금 들어있는 내용은 전부 예시입니다

교수 정보(Prof. Sang Soo Han)와 사진은 실제 내용입니다.
그 외 — 구성원 이름, 동문, 논문 목록, 뉴스, 전화번호(02-880-0000), 이메일(sdl@snu.ac.kr),
호실 번호는 모두 **채워 넣어야 할 자리 표시**입니다. 공개 전에 실제 정보로 교체하세요.

연구실 약칭은 **SDCL** 로 되어 있습니다 (헤더 로고). 다르게 쓰시려면 HTML 파일과
`assets/research-shell.js`에서 `>SDCL<`을 찾아 바꾸면 됩니다.

## 공개하는 법 (GitHub Pages)

1. GitHub에서 새 저장소를 만듭니다.
2. 이 폴더의 파일을 전부 업로드합니다 (`index.html` 이 최상위에 있어야 합니다).
3. 저장소 → Settings → Pages → Source 를 `main` 브랜치 / `/root` 로 지정.
4. 몇 분 뒤 `https://<아이디>.github.io/<저장소이름>/` 에서 열립니다.

학과 서버나 개인 도메인을 쓸 경우에도 파일을 그대로 올리기만 하면 됩니다.
서버 사이드 코드가 없어서 어디에 올려도 동작합니다.

## 참고

- 글꼴: Pretendard (jsDelivr CDN) — 인터넷 연결 필요.
  사내망 등 외부 접속이 막힌 환경에 올릴 경우 글꼴 파일을 내려받아 `assets/` 에 넣고 링크를 바꾸세요.
- 접근성: 키보드 포커스 표시, `prefers-reduced-motion`(애니메이션 최소화 설정) 대응이 되어 있습니다.
- 반응형: 900px 이하에서 햄버거 메뉴, 640px 이하에서 1단 배치로 전환됩니다.


## 임시 링크 만드는 법

내 컴퓨터에서 열어본 홈페이지를, 인터넷이 되는 아무 기기에서나 볼 수 있는 링크로 잠깐 공개하는 방법입니다.
(Cloudflare Tunnel의 "quick tunnel" 기능을 사용합니다 — 별도 계정이나 결제 없이 무료로 쓸 수 있습니다.)

### 0. 준비물 설치 (최초 1회만)

`cloudflared` 프로그램이 필요합니다. 터미널에서:

```bash
brew install cloudflared
```

설치가 잘 됐는지 확인:

```bash
cloudflared --version
```

버전 번호가 출력되면 준비 완료입니다. (Homebrew가 없다면 https://brew.sh 안내에 따라 먼저 설치하세요.)

### 1. 로컬 서버 켜기

터미널에서 이 프로젝트 폴더로 이동한 뒤:

```bash
cd ~/Desktop/snu_homepage
python3 -m http.server 8000
```

이 창을 닫지 말고 그대로 두세요. (`http://localhost:8000` 에서 내 컴퓨터만 접속 가능한 상태로 서버가 켜집니다.)

### 2. 터널 열기

**새 터미널 창**을 하나 더 열고 (1단계 창은 그대로 둔 채) 다음을 실행합니다:

```bash
cloudflared tunnel --url http://localhost:8000
```

몇 초 기다리면 아래처럼 로그가 뜨는데, 그 안에 있는 `https://아무-단어-4개.trycloudflare.com` 형태의 주소가 임시 링크입니다.

```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
|  https://random-words-here.trycloudflare.com                                               |
+--------------------------------------------------------------------------------------------+
```

이 주소를 그대로 복사해서 아무 브라우저(휴대폰 포함)에 붙여넣으면 접속됩니다.

### 3. 끝낼 때

두 터미널 창 모두 `Ctrl + C` 를 눌러 종료하면 됩니다. 링크도 그 순간 바로 끊깁니다.

### 알아두면 좋은 점

- **매번 새 주소**: 터널을 다시 켤 때마다 주소가 랜덤하게 바뀝니다. 같은 주소를 재사용할 수 없습니다.
- **켜져 있는 동안만 유지**: 1·2단계의 두 터미널 창(또는 컴퓨터)이 켜져 있는 동안만 링크가 살아있습니다. 잠자기 모드에 들어가거나 터미널을 닫으면 끊깁니다.
- **새로고침하면 최신 파일 반영**: 로컬 파일을 수정한 뒤 브라우저에서 새로고침하면 바로 반영됩니다 (서버·터널을 다시 켤 필요 없음).
- **비밀번호 없음**: 링크를 아는 사람은 누구나 접속할 수 있습니다. 민감한 내용은 올리지 마세요.
- **한 번에 하나씩**: 1·2단계를 매번 순서대로(서버 먼저, 터널 나중) 새로 실행해야 합니다. 터미널 앱을 완전히 껐다면 두 명령 모두 처음부터 다시 실행하세요.
# SNU-SDCL.github.io
