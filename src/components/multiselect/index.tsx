/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import "./style.css";
import Skeleton from "react-loading-skeleton";
import Highlight from "../highlight";
import { IoClose } from "react-icons/io5";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import RickAndMorty from "../../models/rickAndMorty";
import rickAndMortyService from "../../services/rickAndMortyService";

const Multiselect = () => {
  const [search, setSearch] = useState<string>("");
  const [result, setResult] = useState<RickAndMorty[]>([]);
  const [checkedItems, setCheckedItems] = useState<RickAndMorty[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const focusedWidthIndexRef = useRef<number>(0);
  const focusedHeightIndexRef = useRef<number>(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const resultItemsRef = useRef<RickAndMorty[]>([]);
  const checkedItemsRef = useRef<RickAndMorty[]>([]);

  const isTyping = search.replace(/\s+/, "").length > 0;

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyNavigation);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyNavigation);
    };
  }, []);

  const removeFocusOfElement = () => {
    const beforeFocusedItem = document.querySelector(".focus");
    if (!beforeFocusedItem) {
      return;
    }

    beforeFocusedItem.classList.remove("focus");
  };

  const handleClickOutside = ({ target }) => {
    removeFocusOfElement();
    if (!target.closest(".multiselect") && !target.closest(".close-icon")) {
      setSearch("");
    }
  };

  const handleItemOnChange = (item: RickAndMorty) => {
    const isThereCheckedItem = checkedItemsRef.current.find(
      (i) => i.name === item.name
    );
    if (!isThereCheckedItem) {
      setCheckedItems((prev) => {
        checkedItemsRef.current = [...prev, item];
        return [...prev, item];
      });
      focusedWidthIndexRef.current++;
      return;
    }

    focusedWidthIndexRef.current--;

    setCheckedItems((prev) => {
      const filteredData = prev.filter(
        (item) => item.name !== isThereCheckedItem!.name
      );
      checkedItemsRef.current = filteredData;
      return filteredData;
    });
  };

  const handleKeyNavigation = (event: KeyboardEvent) => {
    const whiteList = [
      "Tab",
      "Delete",
      "ArrowRight",
      "ArrowLeft",
      "ArrowDown",
      "ArrowUp",
      "Escape",
      "Enter",
    ];
    if (!whiteList.includes(event.key)) {
      return;
    }

    event.preventDefault();
    if (event.key === "Delete") {
      const deletedItem = document.querySelector(
        ".close-icon.focus"
      ) as HTMLInputElement;

      if (!deletedItem) {
        return;
      }

      const item = checkedItemsRef.current.find(
        (item) => item.name === deletedItem.dataset.name
      );

      if (!item) {
        return;
      }
      handleItemOnChange(item);
      return;
    }

    if (event.key === "Enter") {
      const focusedItem = document.querySelector(
        ".focused-checkbox.focus"
      ) as HTMLInputElement;

      if (!focusedItem) {
        return;
      }

      if (!focusedItem.checked) {
        focusedItem.checked = true;
      } else {
        focusedItem.checked = false;
      }

      const item = resultItemsRef.current.find(
        (item) => item.name === focusedItem.dataset.name
      );

      if (!item) {
        return;
      }

      handleItemOnChange(item);
    }

    const currentFocusedItem = document.querySelector(
      ".focus"
    ) as HTMLInputElement;
    let currentIndex: number = 0;
    if (currentFocusedItem) {
      currentIndex = +currentFocusedItem.dataset.focusedIndex;
    }

    searchInputRef.current.blur();
    if (event.key === "Escape") {
      focusItem(0);
    }

    if (event.key === "Tab") {
      searchInputRef.current.focus();
      removeFocusOfElement();
    }
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      focusItem(currentIndex + 1);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      if (currentIndex === 0) {
        currentIndex = 1;
      }
      focusItem(currentIndex - 1);
    }
  };

  const focusItem = (index: number) => {
    if (
      index >
        focusedWidthIndexRef.current + focusedHeightIndexRef.current - 1 ||
      focusedHeightIndexRef.current < index ||
      index < 0
    ) {
      return;
    }

    removeFocusOfElement();

    const currentFocusedItem = document.querySelector(
      `[data-focused-index="${index}"]`
    ) as HTMLInputElement;

    currentFocusedItem.classList.add("focus");

    const result = document.querySelector(".search-result");
    if (result && currentFocusedItem.type === "checkbox") {
      ensureVisible(currentFocusedItem);
    }
  };

  function ensureVisible(element: HTMLElement) {
    const container = document.querySelector(".search-result");
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;

    const elementTop = element.offsetTop;
    const elementBottom = elementTop + element.clientHeight;

    const elementParent = element.closest(".search-result-item") as HTMLElement;

    if (elementTop < containerTop) {
      container.scrollTop = elementTop - elementParent.offsetHeight / 2;
      return;
    }

    if (elementBottom > containerBottom) {
      container.scrollTop =
        elementBottom - container.clientHeight + elementParent.offsetHeight / 2;
    }
  }

  useEffect(() => {
    if (!isTyping) {
      focusedHeightIndexRef.current = 0;
      resultItemsRef.current = [];
      setResult([]);
      return;
    }

    setLoading(true);
    const timeOut = setTimeout(() => {
      rickAndMortyService
        .getCharacterWithName(search)
        .then(({ data }) => {
          setResult(data.results);

          setLoading(false);
          focusedHeightIndexRef.current = data.results.length + 1;
          resultItemsRef.current = data.results as RickAndMorty[];
        })
        .catch(() => {
          setLoading(false);
          setResult([]);
          resultItemsRef.current = [];
        });
    }, 500);

    return () => {
      clearTimeout(timeOut);
      setLoading(false);
    };
  }, [search, isTyping]);

  const checkedControl = (item: RickAndMorty) => {
    const isItemChecked = checkedItems.find((i) => i.name === item.name);
    return !!isItemChecked;
  };

  return (
    <div className="multiselect">
      <div className="search">
        <div className="checked-items">
          {checkedItems.map((checkedItem, index) => {
            return (
              <div key={Math.random()} className="checked-item">
                <span>{checkedItem.name}</span>
                <IoClose
                  data-name={checkedItem.name}
                  data-focused-index={index}
                  className="close-icon"
                  onClick={() => handleItemOnChange(checkedItem)}
                />
              </div>
            );
          })}
          <input
            ref={searchInputRef}
            className={isTyping ? "typing" : null}
            placeholder="Search"
            onChange={(event) => setSearch(event.target.value)}
            type="text"
            value={search}
          />
        </div>
        {isTyping ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
      </div>
      {isTyping && (
        <div className="search-result">
          {result.length > 0 &&
            !loading &&
            result.map((item, index) => (
              <div key={item.id} className="search-result-item">
                <input
                  type="checkbox"
                  data-focused-index={index + focusedWidthIndexRef.current}
                  className="focused-checkbox"
                  checked={checkedControl(item)}
                  onChange={() => handleItemOnChange(item)}
                  data-name={item.name}
                />
                <div className="img-container">
                  <img src={item.image} alt="" />
                </div>
                <div className="details">
                  <div>
                    <Highlight
                      text={item.name}
                      match={search}
                      render={(part, key) => <b key={key}>{part}</b>}
                    />
                  </div>
                  <div>{item.episode.length} Episodes</div>
                </div>
              </div>
            ))}
          {loading && <Skeleton height={50} count={5} />}
          {result.length === 0 && !loading && (
            <div className="search-result-not-found">
              "{search}" ile ilgili bir şey bulamadık!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Multiselect;
