# HMS (Hotel/Hostel Management System) API

Bu layihə **Express.js** istifadə edərək yazılmış backend API mühərrikidir. Aşağıda sistemdə mövcud olan bütün API endpoint-lər (routerlar), onların metodları və icra etdikləri funksiyalar barədə detallı məlumat qeyd olunub.

## Qurulum və Qoşulma (Setup)

1. Paketləri yükləmək üçün:
```bash
npm install
```

2. Layihəni başlatmaq üçün:
```bash
npm start
# və ya inkişaf mühitində (development):
npm run dev
```

---

## API Router-ları (Endpoints)

Ümumi router strukturları `/api` prefiksi ilə aşağıdakı 3 əsas hissəyə bölünür:
- **Auth** (`/api/auth`)
- **Reservations** (`/api/reservations`)
- **Teams** (`/api/teams`)

---

### 1. Autentifikasiya (Auth) 🔐

#### `POST /api/auth/register`
- **Açıqlama**: Sistemdə yeni bir istifadəçi hesabı yaradır. Hesab yarandıqdan sonra istifadəçiyə JWT token göndərilir.
- **Mühafizə**: Xeyr
- **Gözlənilən Body**:
  ```json
  {
    "username": "example_user",
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Uğurlu Cavab (201)**: `status: true`, `token`, və istifadəçi məlumatları.

#### `POST /api/auth/login`
- **Açıqlama**: Mövcud istifadəçinin email və parol vasitəsilə sistemə daxil olmasını təmin edir və ona JWT token verir.
- **Mühafizə**: Xeyr
- **Gözlənilən Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```

#### `GET /api/auth/logout`
- **Açıqlama**: İstifadəçinin sistemdən (sessiyadan) çıxış etməsi. Token-in qüvvədən düşməsini təmin edir.
- **Mühafizə**: Xeyr

---

### 2. Rezervasiyalar (Reservations) 📅
Rezervasiya proseslərini idarə etmək üçündür. Bəzi sorğular sorğu başlığında Authorization kimi **Bearer Token** tələb edir.

#### `GET /api/reservations`
- **Açıqlama**: Bütün aktiv və ya keçmiş rezervasiyaları əldə etmək üçün istifadə olunur. `date` query parametri verilərsə, spesifik tarixə uyğun rezervasiyalar qaytarılır.
- **Mühafizə**: Xeyr
- **Query Parametrlər**: `?date=YYYY-MM-DD` (ixtiyari)

#### `POST /api/reservations`
- **Açıqlama**: İstifadəçi tərəfindən yeni masa (veya məkan) rezervasiyası yaratmaq. (İstifadəçinin artıq başqa aktiv rezervasiyası və ya seçilmiş masada kəsişən saatlarda fərqli qeydiyyat yoxdursa, müraciət uğurla təsdiqlənir.)
- **Mühafizə**: Bəli 🔒 (Token tələb orunur)
- **Gözlənilən Body**:
  ```json
  {
    "tableName": "Table-1",
    "date": "2026-03-15",
    "startTime": "14:00",
    "endTime": "16:00"
  }
  ```
- **Xəta Qaydaları**: Gələcək saat olmalıdır. Eyni vaxtda cəmi 1 aktiv rezervasiyanın olması kimi məhdudiyyətləri yoxlayır.

#### `GET /api/reservations/my-recent`
- **Açıqlama**: Hazırkı autentifikasiyadan keçmiş (login olmuş) istifadəçinin özünə aid ən sonuncu rezervasiya(lar)ını gətirir.
- **Mühafizə**: Bəli 🔒

#### `DELETE /api/reservations/:id`
- **Açıqlama**: ID-si URL-də göstərilən mövcud rezervasiyanı silir (və ya ləğv edir).
- **Mühafizə**: Bəli 🔒
- **URL Parametr**: `:id` - rezervasiya obyektinin unikal ID-si.

#### `GET /api/reservations/:tableId/availability`
- **Açıqlama**: Qeyd olunmuş obyektin/masanın cari tarixdə (və ya query vasitəsilə göstərilən `date`-də) boş olub-olmadığını, gələcək rezervasiya saatlarını yoxlayır.
- **Mühafizə**: Xeyr
- **URL Parametr**: `:tableId` - Yoxlanılacaq masanın unikal adı/ıd-si.
- **Query Parametrlər**: `?date=YYYY-MM-DD` (ixtiyari, əgər verilməyibsə bu günün tarixi hesablanır).

---

### 3. Komandalar (Teams) 👥

#### `GET /api/teams/cohorts`
- **Açıqlama**: Sistemdə mövcud olan qrupların və ya kohortların siyahısını qaytarır.
- **Mühafizə**: Bəli 🔒 

#### `GET /api/teams/my-team`
- **Açıqlama**: Cari istifadəçinin aid olduğu komandanın (team) digər üzvlərini və detallarını gətirir.
- **Mühafizə**: Bəli 🔒 

---

## Middlewares (Ara Yaxalamalar)
Sistemdə Endpointləri qorumaq üçün istifadə olunan middleware mövcuddur:
- **`authMiddleware.protect`**: İstəkdə müvafiq icazənin (token və ya session) olub-olmadığını yoxlayır. Yalnız təsdiqlənmiş (authenticated) istifadəçilərə yuxarıda `Bəli 🔒` kimi qeyd olunmuş yollara daxil olmağa icazə verir.

## Texnologiyalar
- **Node.js** & **Express.js** (Backend Framework)
- İstifadə olunan struktur: **MVC** (Model-View-Controller) modifikasiyalı - `controllers`, `router`, `schema`, `middleware`.