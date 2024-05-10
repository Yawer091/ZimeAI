import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Pagination,
  Tag,
  Skeleton,
  ConfigProvider,
  notification,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
const { Search } = Input;
const { Option } = Select;

const UIdata = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialPage = { current: 1, limit: 10, total: 0 };

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    fetchData();
  }, [location]);

  useEffect(() => {
    const searchSlow = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(searchSlow);
  }, [searchQuery, pagination.current, pagination.limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://dummyjson.com/posts/search?q=${searchQuery}&skip=${
          (pagination.current - 1) * pagination.limit
        }&limit=${pagination.limit}`
      );

      if (!res.ok) {
        notification.error({
          placement: "bottomLeft",
          message: "Failed to fetch data",
          description: "ERROR 404",
        });
        // throw new Error("Failed to fetch data");
      }

      const data = await res.json();

      const { posts, total } = data;
      setPosts(posts);
      setPagination((prevPagination) => ({
        ...prevPagination,
        total,
      }));
      const tags = posts.reduce((acc, post) => {
        post.tags.forEach((tag) => {
          if (!acc.includes(tag)) {
            acc.push(tag);
          }
        });
        return acc;
      }, []);
      setAllTags(tags);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handlePageChange = (page, limit) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      limit,
    }));
    navigate(`?page=${page}`);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
    navigate(`?page=1&search=${value}`);
  };

  const handleTagChange = (value) => {
    setSelectedTags(value);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
    navigate(`?page=1&tags=${value.join(",")}`);
  };

  const columns = [
    {
      title: "Post ID",
      dataIndex: "id",
      key: "id",
      width: "10%",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Body",
      dataIndex: "body",
    },

    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      responsive: ["lg"],
      render: (tags) => (
        <>
          {tags.map((tag) => (
            <Tag color="green" key={tag}>
              {tag.toUpperCase()}
            </Tag>
          ))}
        </>
      ),
    },
  ];

  const filteredPosts = selectedTags.length
    ? posts.filter((post) =>
        selectedTags.every((tag) => post.tags.includes(tag))
      )
    : posts;

  return (
    <ConfigProvider prefixCls="my-antd">
      <section className="main">
        <div>
          <h1 className="heading">ZIME AI POSTS</h1>
          <div className="search">
            <Search
              className="sl"
              placeholder="input search text"
              onSearch={handleSearch}
              enterButton
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />
            <Select
              className="sr"
              mode="multiple"
              style={{ minWidth: 200 }}
              placeholder="Filter"
              onChange={handleTagChange}
              defaultValue={selectedTags}
            >
              {allTags.map((tag) => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            {loading ? (
              <Skeleton active />
            ) : (
              <Table
                dataSource={filteredPosts}
                columns={columns}
                pagination={false}
              />
            )}
          </div>
          <div className="pagination">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
            />
          </div>
        </div>
      </section>
    </ConfigProvider>
  );
};

export default UIdata;
