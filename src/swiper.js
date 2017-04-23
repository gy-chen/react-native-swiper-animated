import _ from 'lodash';
import React, { Component } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Animated,
  PanResponder
} from 'react-native';

const { width, height } = Dimensions.get('window');


class Swiper extends Component {

  static defaultProps = {
    swipe_threshold: 0.25
  }

  constructor(props) {
    super(props);

    // set up initial index
    // TODO read initial index from props
    this.state = {
      index: 0
    };
    // set up animation values here
    this.position_y = new Animated.Value(0);
    this.position_y.setOffset(-height);
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const { dy } = gestureState;
        this.position_y.setValue(dy);
       },
       onPanResponderRelease: (evt, gestureState) => {
         const { dy } = gestureState;
         const { swipe_threshold } = this.props;
         if (dy > swipe_threshold * height) {
           // previous page
           this.previous_page();
         } else if (dy < -swipe_threshold * height) {
           // next page
           this.next_page();
         } else {
           // reset poition
           this._reset_position();
         }
        }
    });
  }

  next_page() {
    if (this._has_next_page()) {
      const updated_index = this.state.index + 1;
      Animated.spring(this.position_y, {
        toValue: -height
      }).start(() => {
        this.position_y.setValue(0);
        this.setState({
          index: updated_index
        });
      });
    } else {
      this._reset_position();
    }
  }

  previous_page() {
    if (this._has_previous_page()) {
      const updated_index = this.state.index - 1;
      Animated.spring(this.position_y, {
        toValue: height
      }).start(() => {
        this.position_y.setValue(0);
        this.setState({
          index: updated_index
        });
      });
    } else {
      this._reset_position();
    }
  }

  _reset_position() {
    Animated.spring(this.position_y, {
      toValue: 0
    }).start();
  }

  _has_previous_page() {
    // check the current index and pages in children list to determine whether
    // or not has previous page to render.
    const { index } = this.state;
    const previous_page_index = index - 1;
    return !_.isNull(_.get(this.props, `children[${previous_page_index}]`, null));
  }

  _render_previous_page() {
    const { index } = this.state;
    const previous_page_index = index - 1;
    const previous_page = _.get(this.props, `children[${previous_page_index}]`);
    return (
      <Animated.View key={previous_page_index} style={[styles.animated_container, {
        top: this.position_y
      }]}>
        {previous_page}
      </Animated.View>
    );
  }

  _render_current_page() {
    const { index } = this.state;
    const page = _.get(this.props, `children[${index}]`);
    return (
      <Animated.View key={index} style={[styles.animated_container, {
        top: this.position_y
      }]}>
        {page}
      </Animated.View>
    );
  }

  _has_next_page() {
    const { index } = this.state;
    const next_page_index = index + 1;
    const next_page = _.get(this.props, `children[${next_page_index}]`, null);
    return !_.isNull(next_page);
  }

  _render_next_page() {
    const { index } = this.state;
    const next_page_index = index + 1;
    const next_page = _.get(this.props, `children[${next_page_index}]`);
    return (
      <Animated.View key={next_page_index} style={[styles.animated_container, {
        top: this.position_y
      }]}>
        {next_page}
      </Animated.View>
    );
  }

  render() {
    const pages = [];
    // if has previous page, wrapped in animated view and render it
    pages.push((
      this._render_previous_page()
    ));
    // render current page, wrapped in animated view
    pages.push((
      this._render_current_page()
    ));
    // if has next page, wrapped in animated view and render it
    pages.push((
      this._render_next_page()
    ));
    return (
      <View
        {...this.panResponder.panHandlers}
        style={styles.container}>
        { pages }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  animated_container: {
    width,
    height,
    backgroundColor: 'transparent'
  }
});

export default Swiper;
