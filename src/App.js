import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fakerEN_US, fakerFR, fakerRU } from '@faker-js/faker';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [region, setRegion] = useState('en_US');
  const [data, setData] = useState([]);
  const [errorCountSlider, setErrorCountSlider] = useState(0); // Значение слайдера (0-10)
  const [errorCountField, setErrorCountField] = useState(0);   // Значение поля ввода (0-1000)
  const [seed, setSeed] = useState(42); // Установка seed по умолчанию
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);

  // Функция для генерации ошибок
  const applyRandomError = (str, region) => {
    // Определяем алфавит на основе региона
    const alphabets = {
      'en_US': 'abcdefghijklmnopqrstuvwxyz',
      'fr_FR': 'abcdefghijklmnopqrstuvwxyzàâçéèêëîïôûùüÿñæœ',
      'ru_RU': 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
    };
    const alphabet = alphabets[region] || alphabets['en_US'];

    const errors = [
      (s) => {
        if (s.length <= 1) return s; // Нельзя удалить символ из строки длиной 1
        const index = Math.floor(Math.random() * s.length);
        return s.slice(0, index) + s.slice(index + 1);
      },
      (s) => {
        const charToAdd = alphabet[Math.floor(Math.random() * alphabet.length)];
        const pos = Math.floor(Math.random() * (s.length + 1));
        return s.slice(0, pos) + charToAdd + s.slice(pos);
      },
      (s) => {
        if (s.length <= 1) return s; // Нельзя переставить символы в строке длиной 1
        const pos = Math.floor(Math.random() * (s.length - 1));
        return s.slice(0, pos) + s.charAt(pos + 1) + s.charAt(pos) + s.slice(pos + 2);
      }
    ];

    // Выбираем случайную ошибку
    const errorFunc = errors[Math.floor(Math.random() * errors.length)];
    return errorFunc(str);
  };

  // Генерация данных на основе региона, seed и ошибок
  const generateFakeData = useCallback((region, errorCountField, seed, page) => {
    const combinedSeed = parseInt(seed) + page;
    fakerEN_US.seed(combinedSeed); // Используем общий faker для установки seed
    const generatedData = [];
    let faker;

    // Выбор faker в зависимости от региона
    switch (region) {
      case 'fr_FR':
        faker = fakerFR;
        break;
      case 'ru_RU':
        faker = fakerRU;
        break;
      default:
        faker = fakerEN_US;
    }

    // Генерация данных
    for (let i = 0; i < 20; i++) {
      const gender = Math.random() < 0.5 ? 'male' : 'female';
      const firstName = faker.person.firstName(gender);
      const lastName = faker.person.lastName(gender);
      let person = `${firstName} ${lastName}`;

      let location;
      switch (region) {
        case 'fr_FR':
          location = `${faker.location.city()}, ${faker.location.streetAddress()}`;
          break;
        case 'ru_RU':
          location = `${faker.location.city()}, ${faker.location.street()}, д. ${faker.string.numeric(2)}, кв. ${faker.string.numeric(3)}`;
          break;
        default:
          location = `${faker.location.streetAddress()}, ${faker.location.city()}`;
      }

      // Применение ошибок
      const errors = Math.floor(Math.random() * (errorCountField + 1));
      for (let j = 0; j < errors; j++) {
        person = applyRandomError(person, region);
      }

      generatedData.push({
        id: faker.string.uuid(),
        person: person,
        location,
        phone: faker.phone.number(),
        errors,
      });
    }

    setData(prevData => [...prevData, ...generatedData]);
    setLoading(false);
  }, []);

  useEffect(() => {
    setData([]); // Очищаем данные при изменении параметров
    setPage(1);
    generateFakeData(region, errorCountField, seed, 1);
  }, [region, errorCountField, seed, generateFakeData]);

  useEffect(() => {
    if (page > 1) {
      generateFakeData(region, errorCountField, seed, page);
    }
  }, [page, generateFakeData, region, errorCountField, seed]);

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
      setLoading(true);
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleRegionChange = (event) => {
    setRegion(event.target.value);
  };

  const handleErrorCountChangeSlider = (event) => {
    const value = parseFloat(event.target.value);
    setErrorCountSlider(value);
    setErrorCountField(value); // При изменении слайдера поле принимает его значение
  };

  const handleErrorCountChangeField = (event) => {
    const value = parseFloat(event.target.value);
    setErrorCountField(value);
    setErrorCountSlider(Math.min(value, 10)); // Слайдер принимает min(field.value, 10)
  };

  const handleSeedChange = (event) => {
    setSeed(event.target.value);
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 100000);
    setSeed(randomSeed);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Генератор фейковых данных</h1>

      <div className="mb-3">
        <label className="form-label">Регион:</label>
        <select className="form-select" value={region} onChange={handleRegionChange}>
          <option value="en_US">США</option>
          <option value="fr_FR">Франция</option>
          <option value="ru_RU">Россия</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Количество ошибок:</label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.25"
          value={errorCountSlider}
          onChange={handleErrorCountChangeSlider}
          className="form-range"
        />
        <span>{errorCountSlider.toFixed(2)}</span>
        <input
          type="number"
          className="form-control mt-2"
          min="0"
          max="1000"
          step="0.01"
          value={errorCountField}
          onChange={handleErrorCountChangeField}
          placeholder="Введите количество ошибок"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Seed:</label>
        <div className="input-group">
          <input
            type="number"
            className="form-control"
            value={seed}
            onChange={handleSeedChange}
            placeholder="Введите seed"
          />
          <button className="btn btn-secondary" onClick={generateRandomSeed}>
            Случайный
          </button>
        </div>
      </div>

      <div ref={tableRef} onScroll={handleScroll} style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="table table-striped">
          <thead className="table-dark">
            <tr>
              <th>Номер</th>
              <th>ID</th>
              <th>Имя</th>
              <th>Адрес</th>
              <th>Телефон</th>
              <th>Ошибки</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={`${item.id}-${index}`}>
                <td>{index + 1}</td>
                <td>{item.id}</td>
                <td>{item.person}</td>
                <td>{item.location}</td>
                <td>{item.phone}</td>
                <td>{item.errors}</td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan="6" className="text-center">Загрузка...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
