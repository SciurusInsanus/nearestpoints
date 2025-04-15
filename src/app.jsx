import React, { useState } from "react";

const pickupPoints = [
  { name: "Мария", address: "Боровское шоссе, д.2к7", coords: [55.661496, 37.415622] },
  { name: "Елена", address: "ул. Кусковская, д.17", coords: [55.739407, 37.777419] },
  { name: "Дарья", address: "Варшавское шоссе, д.141к13", coords: [55.587779, 37.603415] },
  { name: "Надежда", address: "ул. Фомичёвой, д.14к3", coords: [55.859615, 37.440658] },
  { name: "Елена", address: "Болотниковская улица, 10А", coords: [55.657306, 37.609991] },
  { name: "Галина (Елизавета)", address: "ул. Константина Федина, д 8", coords: [55.805827, 37.794064] },
  { name: "Анастасия", address: "2-я Хуторская улица, д. 18к2", coords: [55.806762, 37.575109] },
  { name: "Янош", address: "Ленинский проспект, д.93", coords: [55.675245, 37.527920] },
  { name: "Зоомагазин «Хитрый нос»", address: "Ярославское шоссе 12к2", coords: [55.854517, 37.683060] },
  { name: "Dr.Vetson", address: "Балаклавский проспект, д. 9", coords: [55.641122, 37.595501] },
  { name: "Dr.Hug", address: "ул. Малая Филёвская, д.12к1", coords: [55.738302, 37.472917] },
  { name: "Dr.Hug", address: "Хорошёвское шоссе, д. 38Дс3", coords: [55.781003, 37.537550] },
  { name: "Синица", address: "ул. Маршала Неделина, д.16с5", coords: [55.724403, 37.410654] },
  { name: "Пара капибар", address: "ул.Народного ополчения, д.48к1", coords: [55.794032, 37.495078] },
  { name: "Лама рядом", address: "ул.Гродненская, д.10", coords: [55.718076, 37.433597] },
];

const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const fetchCoords = async (stationName) => {
  const apiKey = "74796fe5-c44e-403a-b715-a6e954b3118e"; // 🔑 Yandex API key
  const url = `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=${apiKey}&geocode=метро ${encodeURIComponent(
    stationName
  )}, Москва`;
  const res = await fetch(url);
  const data = await res.json();
  const pos = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos;
  const [lon, lat] = pos.split(" ").map(Number);
  return [lat, lon];
};

const fetchRouteTimes = async (from, to) => {
  const apiKey = "AIzaSyB7J5mkbrV4JsrOz__4GzpD9yXJSIh1S3A"; // 🔑 Вставь свой Google API ключ
  const base = "https://routes.googleapis.com/directions/v2:computeRoutes";
  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": "routes.duration"
  };

  const makeRequest = async (mode) => {
    const res = await fetch(base, {
      method: "POST",
      headers,
      body: JSON.stringify({
        origin: { location: { latLng: { latitude: from[0], longitude: from[1] } } },
        destination: { location: { latLng: { latitude: to[0], longitude: to[1] } } },
        travelMode: mode
      }),
    });
    const data = await res.json();
    const seconds = data.routes?.[0]?.duration?.split("s")[0];
    return seconds ? Math.round(seconds / 60) + " мин" : "н/д";
  };

  return {
    car: await makeRequest("DRIVE"),
    publicTransport: await makeRequest("TRANSIT"),
    walking: "≈" + Math.round(haversineDistance(from, to) / 5 * 60) + " мин",
  };
};

const NearestPickupPoint = () => {
  const [station, setStation] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const stationCoords = await fetchCoords(station);
      const distances = pickupPoints.map((point) => ({
        ...point,
        distance: haversineDistance(stationCoords, point.coords).toFixed(2),
      }));
      const nearest = distances.reduce((a, b) =>
        parseFloat(a.distance) < parseFloat(b.distance) ? a : b
      );

      const routeTimes = await fetchRouteTimes(stationCoords, nearest.coords);

      setResult({ nearest, stationCoords, routeTimes });
    } catch (e) {
      alert("Ошибка при поиске маршрутов.");
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white shadow rounded-xl">
      <h2 className="text-xl font-bold mb-4">Поиск ближайшего пункта сбора</h2>

      <input
        type="text"
        placeholder="Введите станцию метро (например, Октябрьское поле)"
        value={station}
        onChange={(e) => setStation(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      <button
        onClick={handleSearch}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Поиск..." : "Найти ближайший пункт"}
      </button>

      {result && (
        <div className="mt-4">
          <p className="mb-2">
            📍 Ближайший пункт: <strong>{result.nearest.name}</strong>
          </p>
          <p>Адрес: {result.nearest.address}</p>
          <p>Расстояние: {result.nearest.distance} км</p>
          <p>🚌 Общественный транспорт: {result.routeTimes.publicTransport}</p>
          <p>🚗 Машина: {result.routeTimes.car}</p>
          <p>🚶 Пешком: {result.routeTimes.walking}</p>

          <div className="mt-4 p-2 bg-gray-100 rounded">
            <p className="font-bold">📧 Письмо клиенту:</p>
            <pre className="text-sm whitespace-pre-wrap">
{`Вы можете передать помощь в пункте "${result.nearest.name}" по адресу: ${result.nearest.address}.
Расстояние от метро "${station}": ${result.nearest.distance} км.
Примерное время в пути:
- Общественный транспорт: ${result.routeTimes.publicTransport}
- Машина: ${result.routeTimes.car}
- Пешком: ${result.routeTimes.walking}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearestPickupPoint;
