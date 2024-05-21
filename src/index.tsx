import {
  Action,
  ActionPanel,
  Color,
  environment,
  Grid,
  Icon,
  Keyboard,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import feed from "./api/feed";
import { eachHex } from "./utils/util";
import { useCallback, useEffect, useState } from "react";
import { PaletteDetail } from "./components/PaletteDetail";
import { SearchForm } from "./components/SearchForm";
import { Tags } from "./type";
import fetch from "cross-fetch";
import like from "./api/like";
import fs from "fs";
import { useFavorite } from "./hook/useFavorite";

global.fetch = fetch;
const initialTitle = "Website";

export default function Command() {
  const [sort, setSort] = useState("new");
  const [tags, setTags] = useState<Tags>({
    colors: [],
    collections: [],
  });
  useEffect(() => {
    if (!fs.existsSync(environment.supportPath + "/palette")) {
      fs.mkdirSync(environment.supportPath + "/palette");
    }
  }, []);

  const { isLoading, data, pagination, mutate } = feed(sort, tags);

  const { isLoading: favoriteLoading, value, favorite, unFavorite, removeValue } = useFavorite();

  const isFavourite = useCallback(
    (code: string) => {
      if (value) {
        return value.map((item) => item.code).includes(code);
      }
      return false;
    },
    [value],
  );

  const favoriteFunc = async (code: string, svg: string) => {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Liking Palette" });
    try {
      await mutate(like(code).then(() => favorite(code, svg)));
      toast.style = Toast.Style.Success;
      toast.title = "Liked";
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Could not like palette";
      if (error instanceof Error) toast.message = error.message;
    }
  };

  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    let title = initialTitle;
    if (tags.colors.length > 0) {
      title = "Search Tags: " + tags.colors.join(", ");
    }
    if (tags.collections.length > 0) {
      if (title === initialTitle) {
        title = "Search Tags: ";
      } else {
        title += ", ";
      }
      title += tags.collections.join(", ");
    }
    setTitle(title);
  }, [tags, sort]);

  const { pop } = useNavigation();
  return (
    <Grid
      columns={5}
      aspectRatio={"9/16"}
      inset={Grid.Inset.Zero}
      isLoading={isLoading || favoriteLoading}
      pagination={pagination}
      searchBarPlaceholder={`Search in ${(data || []).length} palettes`}
      searchBarAccessory={
        <Grid.Dropdown tooltip="Sort by" storeValue={true} defaultValue="new" onChange={setSort}>
          <Grid.Dropdown.Item value="new" title="New" />
          <Grid.Dropdown.Item value="random" title="Random" />

          <Grid.Dropdown.Section title="Popular">
            <Grid.Dropdown.Item value="popular-month" title="Month" />
            <Grid.Dropdown.Item value="popular-year" title="Year" />
            <Grid.Dropdown.Item value="popular-all" title="All" />
          </Grid.Dropdown.Section>
        </Grid.Dropdown>
      }
    >
      <Grid.Section title={"Favorites"}>
        {(value || []).map((item) => {
          return (
            <Grid.Item
              key={item.code}
              content={item.svg}
              actions={
                <ActionPanel>
                  <Action.Push target={<PaletteDetail id={item.code} />} title="View Details" icon={Icon.Bird} />
                  <Action.Push
                    target={
                      <SearchForm
                        tags={tags}
                        submitCallback={(values) => {
                          setTags(values);
                          pop();
                        }}
                      />
                    }
                    title="Search Palettes"
                    icon={Icon.MagnifyingGlass}
                  />
                  <Action
                    title="Remove From Favorites"
                    onAction={() => unFavorite(item.code)}
                    icon={Icon.StarDisabled}
                    shortcut={Keyboard.Shortcut.Common.Pin}
                  />
                  <Action
                    style={Action.Style.Destructive}
                    title="Remove All Favorites"
                    onAction={removeValue}
                    icon={Icon.Trash}
                    shortcut={Keyboard.Shortcut.Common.RemoveAll}
                  />
                </ActionPanel>
              }
            />
          );
        })}
      </Grid.Section>
      <Grid.Section title={title}>
        {(data || []).map((item, index) => {
          return (
            <Grid.Item
              actions={
                <ActionPanel>
                  <Action.Push target={<PaletteDetail id={item.data.code} />} title="View Details" icon={Icon.Bird} />
                  <Action.Push
                    target={
                      <SearchForm
                        tags={tags}
                        submitCallback={(values) => {
                          setTags(values);
                          pop();
                        }}
                      />
                    }
                    title="Search Palettes"
                    icon={Icon.MagnifyingGlass}
                  />
                  <Action
                    title={isFavourite(item.data.code) ? "Remove From Favorites" : "Like & Favorite"}
                    onAction={async () => {
                      if (isFavourite(item.data.code)) {
                        await unFavorite(item.data.code);
                      } else {
                        await favoriteFunc(item.data.code, item.svg);
                      }
                    }}
                    icon={isFavourite(item.data.code) ? Icon.StarDisabled : Icon.Star}
                    shortcut={Keyboard.Shortcut.Common.Pin}
                  />
                </ActionPanel>
              }
              accessory={
                isFavourite(item.data.code) ? { icon: { source: Icon.Star, tintColor: Color.Yellow } } : undefined
              }
              key={sort === "random" ? item.data.code + index : item.data.code}
              title={`❤ ${item.data.likes}`}
              keywords={Array.from(eachHex(item.data.code))}
              content={item.svg}
            />
          );
        })}
      </Grid.Section>
    </Grid>
  );
}
