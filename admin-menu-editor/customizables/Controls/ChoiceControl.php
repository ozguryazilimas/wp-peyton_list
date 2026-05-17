<?php

namespace YahnisElsts\AdminMenuEditor\Customizable\Controls;

use YahnisElsts\AdminMenuEditor\Customizable\Rendering\Context;
use YahnisElsts\AdminMenuEditor\Customizable\Schemas\Enum;
use YahnisElsts\AdminMenuEditor\Customizable\Settings\EnumSetting;
use YahnisElsts\AdminMenuEditor\Customizable\Settings\Setting;
use YahnisElsts\AdminMenuEditor\Customizable\Settings\WithSchema\SettingWithSchema;

abstract class ChoiceControl extends ClassicControl {
	protected $type = 'choice';

	/**
	 * @var Setting
	 */
	protected $mainBinding;

	/**
	 * @var ChoiceControlOption[]
	 */
	protected $options = [];

	/**
	 * @var array Maps option values to controls in $this->children. Each option can have up to one child control.
	 */
	protected array $optionChildIndex = [];

	public function __construct($settings = [], $params = [], $children = []) {
		parent::__construct($settings, $params, $children);

		if ( isset($params['choices']) ) {
			if ( is_callable($params['choices']) ) {
				$choices = call_user_func($params['choices']);
			} else {
				$choices = $params['choices'];
			}

			foreach ($choices as $key => $item) {
				if ( is_string($item) ) {
					//List of [value => label] pairs.
					$this->options[] = new ChoiceControlOption($key, $item);
				} else if ( is_array($item) ) {
					//List of arrays where each item is [value => X, label => Y, ...].
					//Alternatively, [value => [label => Y, ...]] pairs.
					if ( !array_key_exists('value', $item) ) {
						$item['value'] = $key;
					}
					$this->options[$key] = ChoiceControlOption::fromArray($item);
				} else if ( $item instanceof ChoiceControlOption ) {
					//List of nicely predefined option objects.
					$this->options[] = $item;
				} else {
					throw new \InvalidArgumentException("Invalid option: $item");
				}
			}
		} else if ( $this->mainBinding instanceof EnumSetting ) {
			$this->options = $this->mainBinding->generateChoiceOptions();
		} else if ( $this->mainBinding instanceof SettingWithSchema ) {
			$schema = $this->mainBinding->getSchema();
			if ( $schema instanceof Enum ) {
				$this->options = ChoiceControlOption::fromEnumSchema($schema);
			}
		}

		if ( isset($params['choiceChildren']) ) {
			foreach ($params['choiceChildren'] as $value => $childControl) {
				$this->children[] = $childControl;
				$index = count($this->children) - 1;
				$this->optionChildIndex[$value] = $index;
			}
		}
	}

	protected function addOptionChild($optionValue, UiElement $childControl) {
		$this->children[] = $childControl;
		$index = count($this->children) - 1;
		$this->optionChildIndex[$optionValue] = $index;
	}

	protected function getOptionChild($optionValue): ?UiElement {
		if ( !isset($this->optionChildIndex[$optionValue]) ) {
			return null;
		}
		$index = $this->optionChildIndex[$optionValue];
		return $this->children[$index] ?? null;
	}

	protected function hasOptionChild($optionValue): bool {
		if ( isset($this->optionChildIndex[$optionValue]) ) {
			$index = $this->optionChildIndex[$optionValue];
			return isset($this->children[$index]);
		}
		return false;
	}

	protected function generateRadioInputFor(
		ChoiceControlOption $option,
		string $fieldName,
		bool $isChecked,
		Context $context
	): string {
		return $this->buildTag(
			'input',
			array_merge(array(
				'type'      => 'radio',
				'name'      => $fieldName,
				'value'     => $this->mainBinding->encodeForForm($option->value),
				'class'     => $this->getInputClasses($context),
				'checked'   => $isChecked,
				'disabled'  => !$option->enabled,
				'data-bind' => $this->makeKoDataBind([
					'checked'                   => $this->getKoObservableExpression($option->value),
					'checkedValue'              => wp_json_encode($option->value),
					'ameObservableChangeEvents' => 'true',
				]),
			), $this->inputAttributes)
		);
	}

	protected function getKoComponentParams(): array {
		$params = parent::getKoComponentParams();
		$params['options'] = array_map(
			function ($option) {
				return $option->serializeForJs();
			},
			$this->options
		);

		//Option values can be things that aren't valid JS identifiers, so we'll serialize
		//the option-to-child relationship as an array of value + child index pairs.
		$pairs = [];
		foreach ($this->optionChildIndex as $value => $childIndex) {
			$pairs[] = [$value, $childIndex];
		}
		$params['valueChildIndexes'] = $pairs;

		return $params;
	}
}