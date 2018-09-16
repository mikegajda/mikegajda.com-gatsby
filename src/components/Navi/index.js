import React from 'react'
import { Link } from 'gatsby'

class Navi extends React.Component {
  render() {
    const { location, title } = this.props
    return (
      <nav className="navbar navbar-expand-md navbar-dark bg-primary">
        <div className="container px-0">
          <Link className="text-center" to="/">
            <h1 className="navbar-brand mb-0">{title}</h1>
          </Link>
          <button
            class="navbar-toggler border-0"
            type="button"
            data-toggle="collapse"
            data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon" />
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
              <li class="nav-item active">
                <Link className="nav-link" to="/posts">
                  Posts
                </Link>
              </li>
              <li class="nav-item active">
                <Link className="nav-link" to="/images">
                  Images
                </Link>
              </li>
              <li class="nav-item active">
                <Link className="nav-link" to="/videos">
                  Videos
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    )
  }
}

export default Navi
